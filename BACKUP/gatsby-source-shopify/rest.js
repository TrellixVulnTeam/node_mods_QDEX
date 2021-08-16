"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeShopifyFetch = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const getBaseUrl = (options) => `https://${options.storeUrl}/admin/api/2021-01`;
function makeShopifyFetch(options) {
    const baseUrl = getBaseUrl(options);
    async function shopifyFetch(path, fetchOptions = {
        headers: {
            "X-Shopify-Access-Token": options.password,
        },
    }, retries = 3) {
        /**
         * This is kind of a hack, but...
         *
         * We do this because although callers will use a relative path,
         * some responses might have pagination links that get fed back
         * to shopifyFetch to retrieve the next page. Those links are
         * absolute URLs so we account for both, but not in a very robust
         * fashion.
         */
        const url = path.includes(options.storeUrl) ? path : `${baseUrl}${path}`;
        const resp = await node_fetch_1.default(url, fetchOptions);
        if (!resp.ok) {
            if (retries > 0) {
                if (resp.status === 429) {
                    // rate limit
                    const retryAfter = parseFloat(resp.headers.get(`Retry-After`) || ``);
                    await new Promise(resolve => setTimeout(resolve, retryAfter));
                    return shopifyFetch(path, fetchOptions, retries - 1);
                }
            }
        }
        return resp;
    }
    return async (path) => shopifyFetch(path);
}
exports.makeShopifyFetch = makeShopifyFetch;
//# sourceMappingURL=rest.js.map