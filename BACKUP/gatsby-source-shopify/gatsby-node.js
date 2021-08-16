"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPreInit = exports.createResolvers = exports.sourceNodes = exports.pluginOptionsSchema = exports.createSchemaCustomization = void 0;
const operations_1 = require("./operations");
const events_1 = require("./events");
const resolve_gatsby_image_data_1 = require("./resolve-gatsby-image-data");
const graphql_utils_1 = require("gatsby-plugin-image/graphql-utils");
const shift_left_1 = require("shift-left");
const errors_1 = require("./errors");
const make_source_from_operation_1 = require("./make-source-from-operation");
var create_schema_customization_1 = require("./create-schema-customization");
Object.defineProperty(exports, "createSchemaCustomization", { enumerable: true, get: function () { return create_schema_customization_1.createSchemaCustomization; } });
const node_builder_1 = require("./node-builder");
function pluginOptionsSchema({ Joi, }) {
    // @ts-ignore TODO: When Gatsby updates Joi version, update type
    // Vague type error that we're not able to figure out related to isJoi missing
    // Probably related to Joi being outdated
    return Joi.object({
        password: Joi.string().required(),
        storeUrl: Joi.string()
            .pattern(/^[a-z0-9-]+\.myshopify\.com$/)
            .message(`The storeUrl value should be your store's myshopify.com URL in the form "my-site.myshopify.com", without https or slashes`)
            .required(),
        downloadImages: Joi.boolean(),
        typePrefix: Joi.string()
            .pattern(new RegExp(`(^[A-Z]w*)`))
            .message(`"typePrefix" can only be alphanumeric characters, starting with an uppercase letter`)
            .default(``),
        shopifyConnections: Joi.array()
            .default([])
            .items(Joi.string().valid(`orders`, `collections`, `locations`)),
        salesChannel: Joi.string().default(process.env.GATSBY_SHOPIFY_SALES_CHANNEL || ``),
    });
}
exports.pluginOptionsSchema = pluginOptionsSchema;
async function sourceAllNodes(gatsbyApi, pluginOptions) {
    var _a, _b, _c;
    const { createProductsOperation, createProductVariantsOperation, createOrdersOperation, createCollectionsOperation, createLocationsOperation, finishLastOperation, completedOperation, cancelOperationInProgress, } = operations_1.createOperations(pluginOptions, gatsbyApi);
    const operations = [createProductsOperation, createProductVariantsOperation];
    if ((_a = pluginOptions.shopifyConnections) === null || _a === void 0 ? void 0 : _a.includes(`orders`)) {
        operations.push(createOrdersOperation);
    }
    if ((_b = pluginOptions.shopifyConnections) === null || _b === void 0 ? void 0 : _b.includes(`collections`)) {
        operations.push(createCollectionsOperation);
    }
    if ((_c = pluginOptions.shopifyConnections) === null || _c === void 0 ? void 0 : _c.includes(`locations`)) {
        operations.push(createLocationsOperation);
    }
    const sourceFromOperation = make_source_from_operation_1.makeSourceFromOperation(finishLastOperation, completedOperation, cancelOperationInProgress, gatsbyApi, pluginOptions);
    for (const op of operations) {
        await sourceFromOperation(op);
    }
}
const shopifyNodeTypes = [
    `ShopifyLineItem`,
    `ShopifyProductMetafield`,
    `ShopifyProductVariantMetafield`,
    `ShopifyCollectionMetafield`,
    `ShopifyOrder`,
    `ShopifyLocation`,
    `ShopifyInventoryLevel`,
    `ShopifyProduct`,
    `ShopifyCollection`,
    `ShopifyProductImage`,
    `ShopifyCollectionImage`,
    `ShopifyProductFeaturedImage`,
    `ShopifyProductVariant`,
    `ShopifyProductVariantImage`,
    `ShopifyProductVariantPricePair`,
    `ShopifyProductFeaturedMediaPreviewImage`,
];
async function sourceChangedNodes(gatsbyApi, pluginOptions) {
    var _a, _b, _c, _d, _e;
    const { incrementalProducts, incrementalProductVariants, incrementalOrders, incrementalCollections, incrementalLocations, finishLastOperation, completedOperation, cancelOperationInProgress, } = operations_1.createOperations(pluginOptions, gatsbyApi);
    const { typePrefix = `` } = pluginOptions;
    const lastBuildTime = new Date((_b = (_a = gatsbyApi.store.getState().status.plugins) === null || _a === void 0 ? void 0 : _a[`gatsby-source-shopify`]) === null || _b === void 0 ? void 0 : _b[`lastBuildTime${typePrefix}`]);
    for (const nodeType of shopifyNodeTypes) {
        gatsbyApi
            .getNodesByType(`${typePrefix}${nodeType}`)
            .forEach(node => gatsbyApi.actions.touchNode(node));
    }
    const operations = [
        incrementalProducts(lastBuildTime),
        incrementalProductVariants(lastBuildTime),
    ];
    if ((_c = pluginOptions.shopifyConnections) === null || _c === void 0 ? void 0 : _c.includes(`orders`)) {
        operations.push(incrementalOrders(lastBuildTime));
    }
    if ((_d = pluginOptions.shopifyConnections) === null || _d === void 0 ? void 0 : _d.includes(`collections`)) {
        operations.push(incrementalCollections(lastBuildTime));
    }
    if ((_e = pluginOptions.shopifyConnections) === null || _e === void 0 ? void 0 : _e.includes(`locations`)) {
        operations.push(incrementalLocations(lastBuildTime));
    }
    const sourceFromOperation = make_source_from_operation_1.makeSourceFromOperation(finishLastOperation, completedOperation, cancelOperationInProgress, gatsbyApi, pluginOptions);
    for (const op of operations) {
        await sourceFromOperation(op);
    }
    const { fetchDestroyEventsSince } = events_1.eventsApi(pluginOptions);
    const destroyEvents = await fetchDestroyEventsSince(lastBuildTime);
    gatsbyApi.reporter.info(`${destroyEvents.length} items have been deleted since ${lastBuildTime}`);
    if (destroyEvents.length) {
        gatsbyApi.reporter.info(`Removing matching nodes from Gatsby`);
        destroyEvents.forEach(e => {
            const id = `${typePrefix}gid://shopify/${e.subject_type}/${e.subject_id}`;
            gatsbyApi.reporter.info(`Looking up node with ID: ${id}`);
            const nodeId = node_builder_1.createNodeId(id, gatsbyApi, pluginOptions);
            const node = gatsbyApi.getNode(nodeId);
            if (node) {
                gatsbyApi.reporter.info(`Removing ${node.internal.type}: ${node.id} with shopifyId ${e.subject_id}`);
                gatsbyApi.actions.deleteNode(node);
            }
            else {
                gatsbyApi.reporter.info(`Couldn't find node with ID: ${id}`);
            }
        });
    }
}
async function sourceNodes(gatsbyApi, pluginOptions) {
    var _a;
    const pluginStatus = (_a = gatsbyApi.store.getState().status.plugins) === null || _a === void 0 ? void 0 : _a[`gatsby-source-shopify`];
    const lastBuildTime = pluginStatus === null || pluginStatus === void 0 ? void 0 : pluginStatus[`lastBuildTime${pluginOptions.typePrefix || ``}`];
    if (lastBuildTime !== undefined) {
        gatsbyApi.reporter.info(`Cache is warm, running an incremental build`);
        await sourceChangedNodes(gatsbyApi, pluginOptions);
    }
    else {
        gatsbyApi.reporter.info(`Cache is cold, running a clean build`);
        await sourceAllNodes(gatsbyApi, pluginOptions);
    }
    gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`);
    gatsbyApi.actions.setPluginStatus(pluginStatus !== undefined
        ? Object.assign(Object.assign({}, pluginStatus), { [`lastBuildTime${pluginOptions.typePrefix || ``}`]: Date.now() }) : {
        [`lastBuildTime${pluginOptions.typePrefix || ``}`]: Date.now(),
    });
}
exports.sourceNodes = sourceNodes;
function createResolvers({ createResolvers, cache }, { downloadImages, typePrefix = ``, shopifyConnections = [], }) {
    if (!downloadImages) {
        const args = {
            placeholder: {
                description: `Low resolution version of the image`,
                type: `String`,
                defaultValue: null,
            },
        };
        const imageNodeTypes = [
            `ShopifyProductImage`,
            `ShopifyProductVariantImage`,
            `ShopifyProductFeaturedImage`,
            `ShopifyProductFeaturedMediaPreviewImage`,
        ];
        if (shopifyConnections.includes(`collections`)) {
            imageNodeTypes.push(`ShopifyCollectionImage`);
        }
        const resolvers = imageNodeTypes.reduce((r, nodeType) => {
            return Object.assign(Object.assign({}, r), { [`${typePrefix}${nodeType}`]: {
                    gatsbyImageData: graphql_utils_1.getGatsbyImageResolver(resolve_gatsby_image_data_1.makeResolveGatsbyImageData(cache), args),
                } });
        }, {});
        createResolvers(resolvers);
    }
}
exports.createResolvers = createResolvers;
const getErrorText = (context) => context.sourceMessage;
function onPreInit({ reporter }) {
    reporter.setErrorMap({
        [errors_1.pluginErrorCodes.bulkOperationFailed]: {
            text: getErrorText,
            level: `ERROR`,
            category: `USER`,
        },
        [errors_1.pluginErrorCodes.apiConflict]: {
            text: () => shift_left_1.shiftLeft `
        Your operation was canceled. You might have another production site for this Shopify store.

        Shopify only allows one bulk operation at a time for a given shop, so we recommend that you
        avoid having two production sites that point to the same Shopify store.

        If the duplication is intentional, please wait for the other operation to finish before trying
        again. Otherwise, consider deleting the other site or pointing it to a test store instead.
      `,
            level: `ERROR`,
            category: `USER`,
        },
        /**
         * If we don't know what it is, we haven't done our due
         * diligence to handle it explicitly. That means it's our
         * fault, so THIRD_PARTY indicates us, the plugin authors.
         */
        [errors_1.pluginErrorCodes.unknownSourcingFailure]: {
            text: getErrorText,
            level: `ERROR`,
            category: `THIRD_PARTY`,
        },
        [errors_1.pluginErrorCodes.unknownApiError]: {
            text: getErrorText,
            level: `ERROR`,
            category: `THIRD_PARTY`,
        },
    });
}
exports.onPreInit = onPreInit;
//# sourceMappingURL=gatsby-node.js.map