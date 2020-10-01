import NodeCache, { Options as CacheOptions } from "node-cache";
declare const appCache: NodeCache;
declare function configureCacheControl(options: CacheOptions): void;
export { appCache, configureCacheControl };
