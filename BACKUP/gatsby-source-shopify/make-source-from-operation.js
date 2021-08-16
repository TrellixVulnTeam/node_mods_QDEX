"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSourceFromOperation = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const readline_1 = require("readline");
const shift_left_1 = require("shift-left");
const node_builder_1 = require("./node-builder");
const errors_1 = require("./errors");
function makeSourceFromOperation(finishLastOperation, completedOperation, cancelOperationInProgress, gatsbyApi, pluginOptions) {
    return async function sourceFromOperation(op, isPriorityBuild = process.env.IS_PRODUCTION_BRANCH === `true`) {
        var e_1, _a;
        const { reporter, actions } = gatsbyApi;
        const operationTimer = reporter.activityTimer(`Source from bulk operation ${op.name}`);
        operationTimer.start();
        try {
            if (isPriorityBuild) {
                await cancelOperationInProgress();
            }
            else {
                await finishLastOperation();
            }
            reporter.info(`Initiating bulk operation query ${op.name}`);
            const { bulkOperationRunQuery: { userErrors, bulkOperation }, } = await op.execute();
            if (userErrors.length) {
                reporter.panic(userErrors.map(e => {
                    const msg = e.field
                        ? `${e.field.join(`.`)}: ${e.message}`
                        : e.message;
                    return {
                        id: errors_1.pluginErrorCodes.bulkOperationFailed,
                        context: {
                            sourceMessage: `Couldn't initiate bulk operation query`,
                        },
                        error: new Error(msg),
                    };
                }));
            }
            const resp = await completedOperation(bulkOperation.id);
            reporter.info(`Completed bulk operation ${op.name}: ${bulkOperation.id}`);
            if (parseInt(resp.node.objectCount, 10) === 0) {
                reporter.info(`No data was returned for this operation`);
                operationTimer.end();
                return;
            }
            operationTimer.setStatus(`Fetching ${resp.node.objectCount} results for ${op.name}: ${bulkOperation.id}`);
            const results = await node_fetch_1.default(resp.node.url);
            operationTimer.setStatus(`Processing ${resp.node.objectCount} results for ${op.name}: ${bulkOperation.id}`);
            const rl = readline_1.createInterface({
                input: results.body,
                crlfDelay: Infinity,
            });
            reporter.info(`Creating nodes from bulk operation ${op.name}`);
            const objects = [];
            try {
                for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = await rl_1.next(), !rl_1_1.done;) {
                    const line = rl_1_1.value;
                    objects.push(JSON.parse(line));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) await _a.call(rl_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            await Promise.all(op
                .process(objects, node_builder_1.nodeBuilder(gatsbyApi, pluginOptions), gatsbyApi, pluginOptions)
                .map(async (promise) => {
                const node = await promise;
                actions.createNode(node);
            }));
            operationTimer.end();
        }
        catch (e) {
            if (e instanceof errors_1.OperationError) {
                const code = errors_1.pluginErrorCodes.bulkOperationFailed;
                if (e.node.status === `CANCELED`) {
                    if (isPriorityBuild) {
                        /**
                         * There are at least two production sites for this Shopify
                         * store trying to run an operation at the same time.
                         */
                        reporter.panic({
                            id: errors_1.pluginErrorCodes.apiConflict,
                            error: e,
                            context: {},
                        });
                    }
                    else {
                        // A prod build canceled me, wait and try again
                        operationTimer.setStatus(`This operation has been canceled by a higher priority build. It will retry shortly.`);
                        operationTimer.end();
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        await sourceFromOperation(op);
                    }
                }
                if (e.node.errorCode === `ACCESS_DENIED`) {
                    reporter.panic({
                        id: code,
                        context: {
                            sourceMessage: `Your credentials don't have access to a resource you requested`,
                        },
                        error: e,
                    });
                }
                reporter.panic({
                    id: errors_1.pluginErrorCodes.unknownSourcingFailure,
                    context: {
                        sourceMessage: shift_left_1.shiftLeft `
              Operation ${op.name} failed after ${e.node.objectCount} objects
              - With status: ${e.node.status} - error code: ${e.node.errorCode}
            `,
                    },
                    error: e,
                });
            }
            if (e instanceof errors_1.HttpError) {
                reporter.panic({
                    id: errors_1.pluginErrorCodes.unknownApiError,
                    context: {
                        sourceMessage: `Received error ${e.response.status} from Shopify: ${await e.response.text()}`,
                    },
                    error: e,
                });
            }
            reporter.panic({
                id: errors_1.pluginErrorCodes.unknownSourcingFailure,
                context: {
                    sourceMessage: `Could not source from bulk operation`,
                },
                error: e,
            });
        }
    };
}
exports.makeSourceFromOperation = makeSourceFromOperation;
//# sourceMappingURL=make-source-from-operation.js.map