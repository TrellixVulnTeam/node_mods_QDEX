import { NodeInput, SourceNodesArgs } from "gatsby";
export declare const pattern: RegExp;
export declare function createNodeId(shopifyId: string, gatsbyApi: SourceNodesArgs, { typePrefix }: ShopifyPluginOptions): string;
interface IProcessorMap {
    [remoteType: string]: (node: NodeInput, gatsbyApi: SourceNodesArgs, pluginOptions: ShopifyPluginOptions) => Promise<void>;
}
export declare const processorMap: IProcessorMap;
export declare function nodeBuilder(gatsbyApi: SourceNodesArgs, pluginOptions: ShopifyPluginOptions): NodeBuilder;
export {};