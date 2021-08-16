"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchemaCustomization = void 0;
function addFields(def, fields) {
    def.config.fields = Object.assign(Object.assign({}, (def.config.fields || {})), fields);
}
function defineImageNode(name, schema, pluginOptions, fields = {}) {
    const imageDef = schema.buildObjectType({
        name,
    });
    if (pluginOptions.downloadImages) {
        imageDef.config.fields = {
            localFile: {
                type: `File`,
                extensions: {
                    link: {},
                },
            },
        };
    }
    addFields(imageDef, Object.assign(Object.assign({}, fields), { altText: `String`, height: `Int`, id: `String`, originalSrc: `String!`, transformedSrc: `String!`, width: `Int` }));
    return imageDef;
}
function createSchemaCustomization({ actions, schema }, pluginOptions) {
    var _a, _b, _c;
    const includeCollections = (_a = pluginOptions.shopifyConnections) === null || _a === void 0 ? void 0 : _a.includes(`collections`);
    const includeOrders = (_b = pluginOptions.shopifyConnections) === null || _b === void 0 ? void 0 : _b.includes(`orders`);
    const includeLocations = (_c = pluginOptions.shopifyConnections) === null || _c === void 0 ? void 0 : _c.includes(`locations`);
    const name = (name) => `${pluginOptions.typePrefix || ``}${name}`;
    const sharedMetafieldFields = {
        createdAt: `Date!`,
        description: `String`,
        id: `ID!`,
        key: `String!`,
        namespace: `String!`,
        ownerType: `String!`,
        updatedAt: `Date!`,
        value: `String!`,
        valueType: `String!`,
    };
    const metafieldInterface = schema.buildInterfaceType({
        name: name(`ShopifyMetafieldInterface`),
        fields: sharedMetafieldFields,
        // @ts-ignore TODO: Once Gatsby Core updates its graphql-compose package to a version that has the right
        // types to support interfaces implementing other interfaces, remove the ts-ignore
        interfaces: [`Node`],
    });
    const metafieldOwnerTypes = [`Product`, `ProductVariant`];
    if (includeCollections) {
        metafieldOwnerTypes.push(`Collection`);
    }
    const metafieldTypes = metafieldOwnerTypes.map((ownerType) => {
        const parentKey = ownerType.charAt(0).toLowerCase() + ownerType.slice(1);
        return schema.buildObjectType({
            name: name(`Shopify${ownerType}Metafield`),
            fields: Object.assign(Object.assign({}, sharedMetafieldFields), { [parentKey]: {
                    type: name(`Shopify${ownerType}`),
                    extensions: {
                        link: {
                            from: `${parentKey}Id`,
                            by: `id`,
                        },
                    },
                } }),
            interfaces: [`Node`, name(`ShopifyMetafieldInterface`)],
        });
    });
    const productDef = schema.buildObjectType({
        name: name(`ShopifyProduct`),
        fields: {
            tags: {
                type: `[String]`,
            },
            variants: {
                type: `[${name(`ShopifyProductVariant`)}]`,
                extensions: {
                    link: {
                        from: `id`,
                        by: `productId`,
                    },
                },
            },
            metafields: {
                type: `[${name(`ShopifyProductMetafield`)}]`,
                extensions: {
                    link: {
                        from: `id`,
                        by: `productId`,
                    },
                },
            },
            images: {
                type: `[${name(`ShopifyProductImage`)}]`,
                extensions: {
                    link: {
                        from: `id`,
                        by: `productId`,
                    },
                },
            },
        },
        interfaces: [`Node`],
    });
    const productImageDef = defineImageNode(name(`ShopifyProductImage`), schema, pluginOptions, {
        product: {
            type: name(`ShopifyProduct!`),
            extensions: {
                link: {
                    from: `productId`,
                    by: `id`,
                },
            },
        },
    });
    productImageDef.config.interfaces = [`Node`];
    if (includeCollections) {
        addFields(productDef, {
            collections: {
                type: `[${name(`ShopifyCollection`)}]`,
                extensions: {
                    link: {
                        from: `id`,
                        by: `productIds`,
                    },
                },
            },
        });
    }
    const typeDefs = [
        productDef,
        productImageDef,
        schema.buildObjectType({
            name: name(`ShopifyProductVariant`),
            fields: {
                product: {
                    type: name(`ShopifyProduct!`),
                    extensions: {
                        link: {
                            from: `productId`,
                            by: `id`,
                        },
                    },
                },
                metafields: {
                    type: `[${name(`ShopifyProductVariantMetafield`)}]`,
                    extensions: {
                        link: {
                            from: `id`,
                            by: `productVariantId`,
                        },
                    },
                },
            },
            interfaces: [`Node`],
        }),
        metafieldInterface,
        ...metafieldTypes,
    ];
    if (includeCollections) {
        typeDefs.push(schema.buildObjectType({
            name: name(`ShopifyCollection`),
            fields: {
                products: {
                    type: `[${name(`ShopifyProduct`)}]`,
                    extensions: {
                        link: {
                            from: `productIds`,
                            by: `id`,
                        },
                    },
                },
                metafields: {
                    type: `[${name(`ShopifyCollectionMetafield`)}]`,
                    extensions: {
                        link: {
                            from: `id`,
                            by: `collectionId`,
                        },
                    },
                },
            },
            interfaces: [`Node`],
        }));
    }
    if (includeOrders) {
        typeDefs.push(schema.buildObjectType({
            name: name(`ShopifyOrder`),
            fields: {
                lineItems: {
                    type: `[${name(`ShopifyLineItem`)}]`,
                    extensions: {
                        link: {
                            from: `id`,
                            by: `orderId`,
                        },
                    },
                },
            },
            interfaces: [`Node`],
        }), schema.buildObjectType({
            name: name(`ShopifyLineItem`),
            fields: {
                product: {
                    type: name(`ShopifyProduct`),
                    extensions: {
                        link: {
                            from: `productId`,
                            by: `id`,
                        },
                    },
                },
                order: {
                    type: name(`ShopifyOrder!`),
                    extensions: {
                        link: {
                            from: `orderId`,
                            by: `id`,
                        },
                    },
                },
            },
            interfaces: [`Node`],
        }));
    }
    if (includeLocations) {
        typeDefs.push(schema.buildObjectType({
            name: name(`ShopifyInventoryLevel`),
            fields: {
                location: {
                    type: name(`ShopifyLocation`),
                    extensions: {
                        link: {
                            from: `location.id`,
                            by: `id`,
                        },
                    },
                },
            },
            interfaces: [`Node`],
        }));
    }
    typeDefs.push(...[
        `ShopifyProductFeaturedImage`,
        `ShopifyProductFeaturedMediaPreviewImage`,
        `ShopifyProductVariantImage`,
    ].map(typeName => defineImageNode(name(typeName), schema, pluginOptions)));
    if (includeCollections) {
        typeDefs.push(defineImageNode(name(`ShopifyCollectionImage`), schema, pluginOptions));
    }
    actions.createTypes(typeDefs);
}
exports.createSchemaCustomization = createSchemaCustomization;
//# sourceMappingURL=create-schema-customization.js.map