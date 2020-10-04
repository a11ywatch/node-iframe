import { Options as CacheOptions } from "node-cache";
import { cacheConfig } from "@app/config";

interface AppCache extends CacheOptions {
  disabled?: boolean;
}

let appCache;

// Remove properties to prevent node-cache future side-effects
function _extractValidNodeCacheOptions(options: AppCache): CacheOptions {
  return Object.keys(options).reduce((object, key) => {
    if (key !== "disabled") {
      object[key] = options[key];
    }
    return object;
  }, {});
}

function createCache(): void {
  if (!cacheConfig.disabled) {
    const NodeCache = require("node-cache");
    appCache: NodeCache;
    appCache = new NodeCache(
      _extractValidNodeCacheOptions(appCache?.options || cacheConfig)
    );
  }
}

function configureCacheControl(options: AppCache) {
  if ("disabled" in options) {
    cacheConfig.disabled = !!options.disabled;
    options.disabled ? (appCache = undefined) : createCache();
  }

  if (!cacheConfig.disabled) {
    if (typeof appCache === "undefined") {
      appCache = {};
    }

    appCache.options = Object.assign(
      {},
      appCache?.options,
      _extractValidNodeCacheOptions(options)
    );
  }
}

createCache();

export { appCache, configureCacheControl };
