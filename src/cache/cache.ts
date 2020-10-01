import NodeCache, { Options as CacheOptions } from "node-cache";
import { cacheConfig } from "@app/config";

const appCache = new NodeCache(cacheConfig);

function configureCacheControl(options: CacheOptions) {
  appCache.options = Object.assign({}, appCache.options, options);
}

export { appCache, configureCacheControl };
