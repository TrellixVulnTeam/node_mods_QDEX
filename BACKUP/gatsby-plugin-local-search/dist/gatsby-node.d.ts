import { GatsbyNode, CreatePagesArgs } from 'gatsby';
import { PluginOptions } from './types';
export declare const createPages: (gatsbyContext: CreatePagesArgs, pluginOptions: PluginOptions) => Promise<void>;
export declare const createSchemaCustomization: NonNullable<GatsbyNode['createSchemaCustomization']>;