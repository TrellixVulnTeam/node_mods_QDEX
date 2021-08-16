"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOperations = void 0;
const shift_left_1 = require("shift-left");
const client_1 = require("./client");
const products_query_1 = require("./query-builders/products-query");
const product_variants_query_1 = require("./query-builders/product-variants-query");
const collections_query_1 = require("./query-builders/collections-query");
const orders_query_1 = require("./query-builders/orders-query");
const locations_query_1 = require("./query-builders/locations-query");
const processors_1 = require("./processors");
const errors_1 = require("./errors");
const static_queries_1 = require("./static-queries");
const finishedStatuses = [`COMPLETED`, `FAILED`, `CANCELED`, `EXPIRED`];
const failedStatuses = [`FAILED`, `CANCELED`];
function defaultProcessor(objects, builder) {
    return objects.map(builder.buildNode);
}
function createOperations(options, { reporter }) {
    const client = client_1.createClient(options);
    function currentOperation() {
        return client.request(static_queries_1.OPERATION_STATUS_QUERY);
    }
    function createOperation(operationQuery, name, process) {
        return {
            execute: () => client.request(operationQuery),
            name,
            process: process || defaultProcessor,
        };
    }
    async function finishLastOperation() {
        let { currentBulkOperation } = await currentOperation();
        if (currentBulkOperation && currentBulkOperation.id) {
            const timer = reporter.activityTimer(`Waiting for operation ${currentBulkOperation.id} : ${currentBulkOperation.status}`);
            timer.start();
            while (!finishedStatuses.includes(currentBulkOperation.status)) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                currentBulkOperation = (await currentOperation()).currentBulkOperation;
                timer.setStatus(`Polling operation ${currentBulkOperation.id} : ${currentBulkOperation.status}`);
            }
            timer.end();
        }
    }
    async function cancelOperation(id) {
        return client.request(static_queries_1.CANCEL_OPERATION, {
            id,
        });
    }
    async function cancelOperationInProgress() {
        let { currentBulkOperation: bulkOperation } = await currentOperation();
        if (!bulkOperation) {
            return;
        }
        const cancelTimer = reporter.activityTimer(`Canceling previous operation: ${bulkOperation.id}`);
        cancelTimer.start();
        if (bulkOperation.status === `RUNNING`) {
            cancelTimer.setStatus(`Canceling a currently running operation: ${bulkOperation.id}, this could take a few moments`);
            const { bulkOperationCancel } = await cancelOperation(bulkOperation.id);
            bulkOperation = bulkOperationCancel.bulkOperation;
            while (bulkOperation.status !== `CANCELED`) {
                await new Promise(resolve => setTimeout(resolve, 100));
                const currentOp = await currentOperation();
                bulkOperation = currentOp.currentBulkOperation;
                cancelTimer.setStatus(`Waiting for operation to cancel: ${bulkOperation.id}, ${bulkOperation.status}`);
            }
        }
        else {
            /**
             * Just because it's not running doesn't mean it's done. For
             * example, it could be CANCELING. We still have to wait for it
             * to be officially finished before we start a new one.
             */
            while (!finishedStatuses.includes(bulkOperation.status)) {
                await new Promise(resolve => setTimeout(resolve, 100));
                bulkOperation = (await currentOperation()).currentBulkOperation;
                cancelTimer.setStatus(`Waiting for operation to cancel: ${bulkOperation.id}, ${bulkOperation.status}`);
            }
        }
        cancelTimer.end();
    }
    /* Maybe the interval should be adjustable, because users
     * with larger data sets could easily wait longer. We could
     * perhaps detect that the interval being used is too small
     * based on returned object counts and iteration counts, and
     * surface feedback to the user suggesting that they increase
     * the interval.
     */
    async function completedOperation(operationId, interval = 1000) {
        let operation = await client.request(static_queries_1.OPERATION_BY_ID, {
            id: operationId,
        });
        const completedTimer = reporter.activityTimer(`Waiting for bulk operation to complete`);
        completedTimer.start();
        let waitForOperation = true;
        while (waitForOperation) {
            if (failedStatuses.includes(operation.node.status)) {
                completedTimer.end();
                waitForOperation = false;
                throw new errors_1.OperationError(operation.node);
            }
            if (operation.node.status === `COMPLETED`) {
                completedTimer.end();
                waitForOperation = false;
                return operation;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
            operation = await client.request(static_queries_1.OPERATION_BY_ID, {
                id: operationId,
            });
            completedTimer.setStatus(shift_left_1.shiftLeft `
        Polling bulk operation: ${operation.node.id}
        Status: ${operation.node.status}
        Object count: ${operation.node.objectCount}
      `);
        }
        throw new Error(`It should never reach this error`);
    }
    return {
        incrementalProducts(date) {
            return createOperation(new products_query_1.ProductsQuery(options).query(date), `INCREMENTAL_PRODUCTS`, processors_1.incrementalProductsProcessor);
        },
        incrementalProductVariants(date) {
            return createOperation(new product_variants_query_1.ProductVariantsQuery(options).query(date), `INCREMENTAL_PRODUCT_VARIANTS`, processors_1.productVariantsProcessor);
        },
        incrementalOrders(date) {
            return createOperation(new orders_query_1.OrdersQuery(options).query(date), `INCREMENTAL_ORDERS`);
        },
        incrementalCollections(date) {
            return createOperation(new collections_query_1.CollectionsQuery(options).query(date), `INCREMENTAL_COLLECTIONS`, processors_1.collectionsProcessor);
        },
        incrementalLocations(date) {
            return createOperation(new locations_query_1.LocationsQuery(options).query(date), `INCREMENTAL_LOCATIONS`);
        },
        createProductsOperation: createOperation(new products_query_1.ProductsQuery(options).query(), `PRODUCTS`),
        createProductVariantsOperation: createOperation(new product_variants_query_1.ProductVariantsQuery(options).query(), `PRODUCT_VARIANTS`, processors_1.productVariantsProcessor),
        createOrdersOperation: createOperation(new orders_query_1.OrdersQuery(options).query(), `ORDERS`),
        createCollectionsOperation: createOperation(new collections_query_1.CollectionsQuery(options).query(), `COLLECTIONS`, processors_1.collectionsProcessor),
        createLocationsOperation: createOperation(new locations_query_1.LocationsQuery(options).query(), `LOCATIONS`),
        cancelOperationInProgress,
        cancelOperation,
        finishLastOperation,
        completedOperation,
    };
}
exports.createOperations = createOperations;
//# sourceMappingURL=operations.js.map