"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantsQuery = void 0;
const bulk_query_1 = require("./bulk-query");
class ProductVariantsQuery extends bulk_query_1.BulkQuery {
    query(date) {
        const publishedStatus = this.pluginOptions.salesChannel
            ? encodeURIComponent(`${this.pluginOptions.salesChannel}=visible`)
            : `published`;
        const filters = [`status:active`, `published_status:${publishedStatus}`];
        if (date) {
            const isoDate = date.toISOString();
            filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`);
        }
        const ProductVariantSortKey = `POSITION`;
        const queryString = filters.map(f => `(${f})`).join(` AND `);
        const query = `
      {
        products(query: "${queryString}") {
          edges {
            node {
              id
              variants(sortKey: ${ProductVariantSortKey}) {
                edges {
                  node {
                    availableForSale
                    barcode
                    compareAtPrice
                    createdAt
                    displayName
                    id
                    image {
                      id
                      altText
                      height
                      width
                      originalSrc
                      transformedSrc
                    }
                    inventoryItem {
                      id
                      countryCodeOfOrigin
                      createdAt
                      duplicateSkuCount
                      harmonizedSystemCode
                      inventoryHistoryUrl
                      inventoryLevels {
                        edges {
                          node {
                            id
                            available
                            location {
                              id
                            }
                          }
                        }
                      }
                      legacyResourceId
                      locationsCount
                      provinceCodeOfOrigin
                      requiresShipping
                      sku
                      tracked
                      trackedEditable {
                        locked
                        reason
                      }
                      unitCost {
                        amount
                        currencyCode
                      }
                      updatedAt
                    }
                    inventoryPolicy
                    inventoryQuantity
                    legacyResourceId
                    position
                    price
                    selectedOptions {
                      name
                      value
                    }
                    sellingPlanGroupCount
                    sku
                    storefrontId
                    taxCode
                    taxable
                    title
                    updatedAt
                    weight
                    weightUnit
                    metafields {
                      edges {
                        node {
                          createdAt
                          description
                          id
                          key
                          legacyResourceId
                          namespace
                          ownerType
                          updatedAt
                          value
                          valueType
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
        return this.bulkOperationQuery(query);
    }
}
exports.ProductVariantsQuery = ProductVariantsQuery;
//# sourceMappingURL=product-variants-query.js.map