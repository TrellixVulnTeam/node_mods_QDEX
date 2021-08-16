"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeResolveGatsbyImageData = void 0;
const gatsby_core_utils_1 = require("gatsby-core-utils");
const gatsby_plugin_image_1 = require("gatsby-plugin-image");
const fs_1 = require("fs");
const get_shopify_image_1 = require("./get-shopify-image");
async function getImageBase64({ imageAddress, cache, }) {
    // Downloads file to the site cache and returns the file path for the given image (this is a path on the host system, not a URL)
    const filePath = await gatsby_core_utils_1.fetchRemoteFile({
        url: imageAddress,
        cache,
    });
    const buffer = fs_1.readFileSync(filePath);
    return buffer.toString(`base64`);
}
/**
 * Download and generate a low-resolution placeholder
 *
 * @param lowResImageFile
 */
function getBase64DataURI({ imageBase64 }) {
    return `data:image/png;base64,${imageBase64}`;
}
function makeResolveGatsbyImageData(cache) {
    return async function resolveGatsbyImageData(image, _a) {
        var { formats = [`auto`], layout = `constrained` } = _a, options = __rest(_a, ["formats", "layout"]);
        const remainingOptions = options;
        let [basename] = image.originalSrc.split(`?`);
        const dot = basename.lastIndexOf(`.`);
        let ext = ``;
        if (dot !== -1) {
            ext = basename.slice(dot + 1);
            basename = basename.slice(0, dot);
        }
        const generateImageSource = (filename, width, height, toFormat) => {
            return {
                width,
                height,
                placeholder: ``,
                format: toFormat,
                src: get_shopify_image_1.urlBuilder({
                    width,
                    height,
                    baseUrl: filename,
                    format: toFormat,
                    options: {},
                }),
            };
        };
        const sourceMetadata = {
            width: image.width,
            height: image.height,
            format: ext,
        };
        if (remainingOptions && remainingOptions.placeholder === `BLURRED`) {
            // This function returns the URL for a 20px-wide image, to use as a blurred placeholder
            const lowResImageURL = gatsby_plugin_image_1.getLowResolutionImageURL(Object.assign(Object.assign({}, remainingOptions), { aspectRatio: remainingOptions.width / remainingOptions.height, // Workaround - fixes height being NaN; we can remove this once gatsby-plugin-image is fixed
                formats,
                layout,
                sourceMetadata, pluginName: `gatsby-source-shopify`, filename: image.originalSrc, generateImageSource }));
            const imageBase64 = await getImageBase64({
                imageAddress: lowResImageURL,
                cache,
            });
            // This would be your own function to download and generate a low-resolution placeholder
            remainingOptions.placeholderURL = getBase64DataURI({
                imageBase64,
            });
        }
        return gatsby_plugin_image_1.generateImageData(Object.assign(Object.assign({}, remainingOptions), { formats,
            layout,
            sourceMetadata, pluginName: `gatsby-source-shopify`, filename: image.originalSrc, generateImageSource }));
    };
}
exports.makeResolveGatsbyImageData = makeResolveGatsbyImageData;
//# sourceMappingURL=resolve-gatsby-image-data.js.map