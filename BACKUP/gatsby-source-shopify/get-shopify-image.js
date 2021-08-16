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
exports.getShopifyImage = exports.urlBuilder = void 0;
const gatsby_plugin_image_1 = require("gatsby-plugin-image");
const validFormats = new Set([`jpg`, `png`, `webp`, `auto`]);
function urlBuilder({ width, height, baseUrl, format, }) {
    if (!validFormats.has(format)) {
        console.warn(`${format} is not a valid format. Valid formats are: ${[
            ...validFormats,
        ].join(`, `)}`);
        format = `auto`;
    }
    let [basename, version] = baseUrl.split(`?`);
    const dot = basename.lastIndexOf(`.`);
    let ext = ``;
    if (dot !== -1) {
        ext = basename.slice(dot + 1);
        basename = basename.slice(0, dot);
    }
    let suffix = ``;
    if (format === ext || format === `auto`) {
        suffix = `.${ext}`;
    }
    else {
        suffix = `.${ext}.${format}`;
    }
    return `${basename}_${width}x${height}_crop_center${suffix}?${version}`;
}
exports.urlBuilder = urlBuilder;
function getShopifyImage(_a) {
    var { image } = _a, args = __rest(_a, ["image"]);
    const { originalSrc: baseUrl, width: sourceWidth, height: sourceHeight, } = image;
    return gatsby_plugin_image_1.getImageData(Object.assign(Object.assign({}, args), { baseUrl,
        sourceWidth,
        sourceHeight,
        urlBuilder, formats: [`auto`] }));
}
exports.getShopifyImage = getShopifyImage;
//# sourceMappingURL=get-shopify-image.js.map