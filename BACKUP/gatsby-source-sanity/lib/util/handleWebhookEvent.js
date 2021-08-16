"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhookEvent = void 0;
const debug_1 = __importDefault(require("../debug"));
const normalize_1 = require("./normalize");
const documentIds_1 = require("./documentIds");
async function handleWebhookEvent(args, options) {
    const { webhookBody, reporter } = args;
    if (!validatePayload(webhookBody)) {
        debug_1.default('Invalid/non-sanity webhook payload received');
        return false;
    }
    reporter.info('[sanity] Processing changed documents from webhook');
    const { client, processingOptions } = options;
    const { ids } = webhookBody;
    const { created, deleted, updated } = ids;
    const refetchIds = [...created, ...updated];
    let numRefreshed = 0;
    if (deleted.length > 0) {
        numRefreshed += handleDeletedDocuments(args, deleted);
    }
    let touchedDocs = [];
    if (refetchIds.length > 0) {
        reporter.info(`[sanity] Refetching ${refetchIds.length} documents`);
        const newDocuments = await client.getDocuments(refetchIds, {
            tag: 'sanity.gatsby.webhook-refetch',
        });
        touchedDocs = newDocuments.filter(isDocument);
    }
    if (created.length > 0) {
        const createdDocs = created
            .map((id) => touchedDocs.find((doc) => doc && doc._id === id))
            .filter(isDocument);
        numRefreshed += handleChangedDocuments(args, createdDocs, processingOptions, 'created');
    }
    if (updated.length > 0) {
        const updatedDocs = updated
            .map((id) => touchedDocs.find((doc) => doc && doc._id === id))
            .filter(isDocument);
        numRefreshed += handleChangedDocuments(args, updatedDocs, processingOptions, 'created');
    }
    reporter.info(`Refreshed ${numRefreshed} documents`);
    return true;
}
exports.handleWebhookEvent = handleWebhookEvent;
function handleDeletedDocuments(context, ids) {
    const { actions, createNodeId, getNode } = context;
    const { deleteNode } = actions;
    return ids
        .map((documentId) => getNode(documentIds_1.safeId(documentIds_1.unprefixId(documentId), createNodeId)))
        .filter((node) => typeof node !== 'undefined')
        .reduce((count, node) => {
        debug_1.default('Deleted document with ID %s', node._id);
        deleteNode(node);
        return count + 1;
    }, 0);
}
function handleChangedDocuments(args, changedDocs, processingOptions, action) {
    const { reporter } = args;
    const { typeMap } = processingOptions;
    return changedDocs.reduce((count, doc) => {
        const type = normalize_1.getTypeName(doc._type);
        if (!typeMap.objects[type]) {
            reporter.warn(`[sanity] Document "${doc._id}" has type ${doc._type} (${type}), which is not declared in the GraphQL schema. Make sure you run "graphql deploy". Skipping document.`);
            return count;
        }
        debug_1.default('%s document with ID %s', action === 'created' ? 'Created' : 'Updated', doc._id);
        processingOptions.createNode(normalize_1.toGatsbyNode(doc, processingOptions));
        return count + 1;
    }, 0);
}
function isDocument(doc) {
    return Boolean(doc && doc._id);
}
function validatePayload(payload) {
    if (!payload || typeof payload.ids !== 'object') {
        return false;
    }
    const { created, deleted, updated } = payload.ids;
    if (!Array.isArray(created) || !Array.isArray(deleted) || !Array.isArray(updated)) {
        return false;
    }
    return true;
}
//# sourceMappingURL=handleWebhookEvent.js.map