"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFieldsOnGraphQLNodeType = exports.sourceNodes = exports.createSchemaCustomization = exports.createResolvers = exports.onPreBootstrap = exports.onPreInit = void 0;
const operators_1 = require("rxjs/operators");
const package_json_1 = __importDefault(require("gatsby/package.json"));
const client_1 = __importDefault(require("@sanity/client"));
const normalize_1 = require("./util/normalize");
const cache_1 = require("./util/cache");
const handleWebhookEvent_1 = require("./util/handleWebhookEvent");
const remoteGraphQLSchema_1 = require("./util/remoteGraphQLSchema");
const errors_1 = require("./util/errors");
const extendImageNode_1 = require("./images/extendImageNode");
const rewriteGraphQLSchema_1 = require("./util/rewriteGraphQLSchema");
const getGraphQLResolverMap_1 = require("./util/getGraphQLResolverMap");
const documentIds_1 = require("./util/documentIds");
const getAllDocuments_1 = require("./util/getAllDocuments");
const oneline_1 = __importDefault(require("oneline"));
const lodash_1 = require("lodash");
const debug_1 = __importDefault(require("./debug"));
const defaultConfig = {
    version: '1',
    overlayDrafts: false,
    graphqlTag: 'default',
};
const stateCache = {};
const onPreInit = async ({ reporter }) => {
    // Old versions of Gatsby does not have this method
    if (reporter.setErrorMap) {
        reporter.setErrorMap(errors_1.ERROR_MAP);
    }
};
exports.onPreInit = onPreInit;
const onPreBootstrap = async (args, pluginOptions) => {
    const config = Object.assign(Object.assign({}, defaultConfig), pluginOptions);
    const { reporter } = args;
    if (Number(package_json_1.default.version.split('.')[0]) < 3) {
        const unsupportedVersionMessage = oneline_1.default `
    You are using a version of Gatsby not supported by gatsby-source-sanity.
    Upgrade gatsby to >= 3.0.0 to continue.`;
        reporter.panic({
            id: errors_1.prefixId(errors_1.ERROR_CODES.UnsupportedGatsbyVersion),
            context: { sourceMessage: unsupportedVersionMessage },
        });
        return;
    }
    // Actually throws in validation function, but helps typescript perform type narrowing
    if (!validateConfig(config, reporter)) {
        throw new Error('Invalid config');
    }
    try {
        reporter.info('[sanity] Fetching remote GraphQL schema');
        const client = getClient(config);
        const api = await remoteGraphQLSchema_1.getRemoteGraphQLSchema(client, config);
        reporter.info('[sanity] Transforming to Gatsby-compatible GraphQL SDL');
        const graphqlSdl = await rewriteGraphQLSchema_1.rewriteGraphQLSchema(api, { config, reporter });
        const graphqlSdlKey = cache_1.getCacheKey(config, cache_1.CACHE_KEYS.GRAPHQL_SDL);
        stateCache[graphqlSdlKey] = graphqlSdl;
        reporter.info('[sanity] Stitching GraphQL schemas from SDL');
        const typeMap = remoteGraphQLSchema_1.getTypeMapFromGraphQLSchema(api);
        const typeMapKey = cache_1.getCacheKey(config, cache_1.CACHE_KEYS.TYPE_MAP);
        stateCache[typeMapKey] = typeMap;
    }
    catch (err) {
        if (err.isWarning) {
            err.message.split('\n').forEach((line) => reporter.warn(line));
            return;
        }
        if (typeof err.code === 'string' && errors_1.SANITY_ERROR_CODE_MAP[err.code]) {
            reporter.panic({
                id: documentIds_1.prefixId(errors_1.SANITY_ERROR_CODE_MAP[err.code]),
                context: { sourceMessage: `[sanity] ${errors_1.SANITY_ERROR_CODE_MESSAGES[err.code]}` },
            });
        }
        const prefix = typeof err.code === 'string' ? `[${err.code}] ` : '';
        reporter.panic({
            id: documentIds_1.prefixId(errors_1.ERROR_CODES.SchemaFetchError),
            context: { sourceMessage: `${prefix}${err.message}` },
        });
    }
};
exports.onPreBootstrap = onPreBootstrap;
const createResolvers = (args, pluginOptions) => {
    const typeMapKey = cache_1.getCacheKey(pluginOptions, cache_1.CACHE_KEYS.TYPE_MAP);
    const typeMap = (stateCache[typeMapKey] || remoteGraphQLSchema_1.defaultTypeMap);
    args.createResolvers(getGraphQLResolverMap_1.getGraphQLResolverMap(typeMap, pluginOptions, args));
};
exports.createResolvers = createResolvers;
const createSchemaCustomization = ({ actions }, pluginConfig) => {
    const { createTypes } = actions;
    const graphqlSdlKey = cache_1.getCacheKey(pluginConfig, cache_1.CACHE_KEYS.GRAPHQL_SDL);
    const graphqlSdl = stateCache[graphqlSdlKey];
    createTypes(graphqlSdl);
};
exports.createSchemaCustomization = createSchemaCustomization;
const sourceNodes = async (args, pluginConfig) => {
    const config = Object.assign(Object.assign({}, defaultConfig), pluginConfig);
    const { dataset, overlayDrafts, watchMode } = config;
    const { actions, createNodeId, createContentDigest, reporter, webhookBody } = args;
    const { createNode, deleteNode, createParentChildLink } = actions;
    const typeMapKey = cache_1.getCacheKey(pluginConfig, cache_1.CACHE_KEYS.TYPE_MAP);
    const typeMap = (stateCache[typeMapKey] || remoteGraphQLSchema_1.defaultTypeMap);
    const client = getClient(config);
    const url = client.getUrl(`/data/export/${dataset}?tag=sanity.gatsby.source-nodes`);
    // Stitches together required methods from within the context and actions objects
    const processingOptions = {
        typeMap,
        createNodeId,
        createNode,
        createContentDigest,
        createParentChildLink,
        overlayDrafts,
    };
    if (webhookBody &&
        webhookBody.ids &&
        (await handleWebhookEvent_1.handleWebhookEvent(args, { client, processingOptions }))) {
        // If the payload was handled by the webhook handler, fall back.
        // Otherwise, this may not be a Sanity webhook, but we should
        // still attempt to refresh our data
        return;
    }
    reporter.info('[sanity] Fetching export stream for dataset');
    const documents = await downloadDocuments(url, config.token, { includeDrafts: overlayDrafts });
    const gatsbyNodes = new Map();
    // sync a single document from the local cache of known documents with gatsby
    function syncWithGatsby(id) {
        const publishedId = documentIds_1.unprefixId(id);
        const draftId = documentIds_1.prefixId(id);
        const published = documents.get(publishedId);
        const draft = documents.get(draftId);
        const doc = draft || published;
        if (doc) {
            const type = normalize_1.getTypeName(doc._type);
            if (!typeMap.objects[type]) {
                reporter.warn(`[sanity] Document "${doc._id}" has type ${doc._type} (${type}), which is not declared in the GraphQL schema. Make sure you run "graphql deploy". Skipping document.`);
                return;
            }
        }
        if (id === draftId && !overlayDrafts) {
            // do nothing, we're not overlaying drafts
            debug_1.default('overlayDrafts is not enabled, so skipping createNode for draft');
            return;
        }
        if (id === publishedId) {
            if (draft && overlayDrafts) {
                // we have a draft, and overlayDrafts is enabled, so skip to the draft document instead
                debug_1.default('skipping createNode of %s since there is a draft and overlayDrafts is enabled', publishedId);
                return;
            }
            if (gatsbyNodes.has(publishedId)) {
                // sync existing gatsby node with document from updated cache
                if (published) {
                    debug_1.default('updating gatsby node for %s', publishedId);
                    const node = normalize_1.toGatsbyNode(published, processingOptions);
                    gatsbyNodes.set(publishedId, node);
                    createNode(node);
                }
                else {
                    // the published document has been removed (note - we either have no draft or overlayDrafts is not enabled so merely removing is ok here)
                    debug_1.default('deleting gatsby node for %s since there is no draft and overlayDrafts is not enabled', publishedId);
                    deleteNode(gatsbyNodes.get(publishedId));
                    gatsbyNodes.delete(publishedId);
                }
            }
            else if (published) {
                // when we don't have a gatsby node for the published document
                debug_1.default('creating gatsby node for %s', publishedId);
                const node = normalize_1.toGatsbyNode(published, processingOptions);
                gatsbyNodes.set(publishedId, node);
                createNode(node);
            }
        }
        if (id === draftId && overlayDrafts) {
            // we're syncing a draft version and overlayDrafts is enabled
            if (gatsbyNodes.has(publishedId) && !draft && !published) {
                // have stale gatsby node for a published document that has neither a draft or a published (e.g. it's been deleted)
                debug_1.default('deleting gatsby node for %s since there is neither a draft nor a published version of it any more', publishedId);
                deleteNode(gatsbyNodes.get(publishedId));
                gatsbyNodes.delete(publishedId);
                return;
            }
            debug_1.default('Replacing gatsby node for %s using the %s document', publishedId, draft ? 'draft' : 'published');
            // pick the draft if we can, otherwise pick the published
            const node = normalize_1.toGatsbyNode((draft || published), processingOptions);
            gatsbyNodes.set(publishedId, node);
            createNode(node);
        }
    }
    function syncAllWithGatsby() {
        for (const id of documents.keys()) {
            syncWithGatsby(id);
        }
    }
    function syncIdsWithGatsby(ids) {
        for (const id of ids) {
            syncWithGatsby(id);
        }
    }
    if (watchMode) {
        // Note: since we don't setup the listener before *after* all documents has been fetched here we will miss any events that
        // happened in the time window between the documents was fetched and the listener connected. If this happens, the
        // preview will show an outdated version of the document.
        reporter.info('[sanity] Watch mode enabled, starting a listener');
        client
            .listen('*[!(_id in path("_.**"))]')
            .pipe(operators_1.filter((event) => overlayDrafts || !event.documentId.startsWith('drafts.')), operators_1.tap((event) => {
            if (event.result) {
                documents.set(event.documentId, event.result);
            }
            else {
                documents.delete(event.documentId);
            }
        }), operators_1.map((event) => event.documentId), operators_1.bufferTime(100), operators_1.map((ids) => lodash_1.uniq(ids)), operators_1.filter((ids) => ids.length > 0), operators_1.tap((updateIds) => debug_1.default('The following documents updated and will be synced with gatsby: ', updateIds)), operators_1.tap((updatedIds) => syncIdsWithGatsby(updatedIds)))
            .subscribe();
    }
    // do the initial sync from sanity documents to gatsby nodes
    syncAllWithGatsby();
    reporter.info(`[sanity] Done! Exported ${documents.size} documents.`);
};
exports.sourceNodes = sourceNodes;
const setFieldsOnGraphQLNodeType = async (context, pluginConfig) => {
    const { type } = context;
    let fields = {};
    if (type.name === 'SanityImageAsset') {
        fields = Object.assign(Object.assign({}, fields), extendImageNode_1.extendImageNode(pluginConfig));
    }
    return fields;
};
exports.setFieldsOnGraphQLNodeType = setFieldsOnGraphQLNodeType;
function validateConfig(config, reporter) {
    if (!config.projectId) {
        reporter.panic({
            id: documentIds_1.prefixId(errors_1.ERROR_CODES.MissingProjectId),
            context: { sourceMessage: '[sanity] `projectId` must be specified' },
        });
    }
    if (!config.dataset) {
        reporter.panic({
            id: documentIds_1.prefixId(errors_1.ERROR_CODES.MissingDataset),
            context: { sourceMessage: '[sanity] `dataset` must be specified' },
        });
    }
    if (config.overlayDrafts && !config.token) {
        reporter.warn('[sanity] `overlayDrafts` is set to `true`, but no token is given');
    }
    const inDevelopMode = process.env.gatsby_executing_command === 'develop';
    if (config.watchMode && !inDevelopMode) {
        reporter.warn('[sanity] Using `watchMode` when not in develop mode might prevent your build from completing');
    }
    return true;
}
function downloadDocuments(url, token, options = {}) {
    return getAllDocuments_1.getAllDocuments(url, token, options).then((stream) => new Promise((resolve, reject) => {
        const documents = new Map();
        stream.on('data', (doc) => {
            documents.set(doc._id, doc);
        });
        stream.on('end', () => {
            resolve(documents);
        });
        stream.on('error', (error) => {
            reject(error);
        });
    }));
}
function getClient(config) {
    const { projectId, dataset, token } = config;
    return new client_1.default({
        projectId,
        dataset,
        token,
        apiVersion: '1',
        useCdn: false,
    });
}
//# sourceMappingURL=gatsby-node.js.map