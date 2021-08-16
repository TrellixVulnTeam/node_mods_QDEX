"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsQuery = void 0;
const bulk_query_1 = require("./bulk-query");
class CollectionsQuery extends bulk_query_1.BulkQuery {
    query(date) {
        const publishedStatus = this.pluginOptions.salesChannel
            ? encodeURIComponent(`${this.pluginOptions.salesChannel}=visible`)
            : `published`;
        const filters = [`published_status:${publishedStatus}`];
        if (date) {
            const isoDate = date.toISOString();
            filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`);
        }
        const queryString = filters.map(f => `(${f})`).join(` AND `);
        const query = `
      {
        collections(query: "${queryString}") {
          edges {
            node {
              products {
                edges {
                  node {
                    id
                  }
                }
              }
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
              description
              descriptionHtml
              feedback {
                details {
                  app {
                    id
                  }
                  link {
                    label
                    url
                  }
                  messages {
                    field
                    message
                  }
                }
                summary
              }
              handle
              id
              image {
                id
                altText
                height
                width
                originalSrc
                transformedSrc
              }
              legacyResourceId
              productsCount
              ruleSet {
                appliedDisjunctively
                rules {
                  column
                  condition
                  relation
                }
              }
              seo {
                description
                title
              }
              sortOrder
              storefrontId
              templateSuffix
              title
              updatedAt
            }
          }
        }
      }
      `;
        return this.bulkOperationQuery(query);
    }
}
exports.CollectionsQuery = CollectionsQuery;
//# sourceMappingURL=collections-query.js.map