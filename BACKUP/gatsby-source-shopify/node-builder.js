"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeBuilder = exports.processorMap = exports.createNodeId = exports.pattern = void 0;
const gatsby_source_filesystem_1 = require("gatsby-source-filesystem");
// 'gid://shopify/Metafield/6936247730264'
exports.pattern = /^gid:\/\/shopify\/(\w+)\/(.+)$/;
function createNodeId(shopifyId, gatsbyApi, { typePrefix = `` }) {
    return gatsbyApi.createNodeId(`${typePrefix}${shopifyId}`);
}
exports.createNodeId = createNodeId;
function attachParentId(result, gatsbyApi, pluginOptions) {
    if (result.__parentId) {
        const [fullId, remoteType] = result.__parentId.match(exports.pattern) || [];
        const field = remoteType.charAt(0).toLowerCase() + remoteType.slice(1);
        const idField = `${field}Id`;
        result[idField] = createNodeId(fullId, gatsbyApi, pluginOptions);
    }
}
const downloadImageAndCreateFileNode = async ({ url, nodeId }, { actions: { createNode }, createNodeId, cache, store, reporter, }) => {
    const fileNode = await gatsby_source_filesystem_1.createRemoteFileNode({
        url,
        cache,
        createNode,
        createNodeId,
        parentNodeId: nodeId,
        store,
        reporter,
    });
    return fileNode.id;
};
async function processChildImage(node, getImageData, gatsbyApi, pluginOptions) {
    if (pluginOptions.downloadImages) {
        const image = getImageData(node);
        if (image) {
            const url = image.originalSrc;
            const fileNodeId = await downloadImageAndCreateFileNode({
                url,
                nodeId: node.id,
            }, gatsbyApi);
            image.localFile = fileNodeId;
        }
    }
}
exports.processorMap = {
    LineItem: async (node, gatsbyApi, pluginOptions) => {
        const lineItem = node;
        if (lineItem.product) {
            lineItem.productId = createNodeId(lineItem.product.id, gatsbyApi, pluginOptions);
            delete lineItem.product;
        }
    },
    ProductImage: async (node, gatsbyApi, options) => {
        if (options.downloadImages) {
            const url = node.originalSrc;
            const fileNodeId = await downloadImageAndCreateFileNode({
                url,
                nodeId: node.id,
            }, gatsbyApi);
            node.localFile = fileNodeId;
        }
    },
    Collection: async (node, gatsbyApi, options) => processChildImage(node, node => node.image, gatsbyApi, options),
    Product: async (node, gatsbyApi, options) => {
        await processChildImage(node, node => node.featuredImage, gatsbyApi, options);
        await processChildImage(node, node => {
            var _a;
            const media = node.featuredMedia;
            return (_a = media === null || media === void 0 ? void 0 : media.preview) === null || _a === void 0 ? void 0 : _a.image;
        }, gatsbyApi, options);
    },
    ProductVariant: async (node, gatsbyApi, options) => processChildImage(node, node => node.image, gatsbyApi, options),
    Metafield: async (node, _gatsbyApi, { typePrefix = `` }) => {
        const [, parentType] = node.__parentId.match(exports.pattern) || [];
        const internalType = `${typePrefix}Shopify${parentType}Metafield`;
        node.internal.type = internalType;
    },
};
function nodeBuilder(gatsbyApi, pluginOptions) {
    return {
        async buildNode(result) {
            if (!exports.pattern.test(result.id)) {
                throw new Error(`Expected an ID in the format gid://shopify/<typename>/<id>`);
            }
            const [, remoteType] = result.id.match(exports.pattern) || [];
            const processor = exports.processorMap[remoteType] || (() => Promise.resolve());
            attachParentId(result, gatsbyApi, pluginOptions);
            const node = Object.assign(Object.assign({}, result), { shopifyId: result.id, id: createNodeId(result.id, gatsbyApi, pluginOptions), internal: {
                    type: `${pluginOptions.typePrefix || ``}Shopify${remoteType}`,
                    contentDigest: gatsbyApi.createContentDigest(result),
                } });
            await processor(node, gatsbyApi, pluginOptions);
            return node;
        },
    };
}
exports.nodeBuilder = nodeBuilder;
//# sourceMappingURL=node-builder.js.map