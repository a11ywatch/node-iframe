import NodeCache, { Options as CacheOptions } from "node-cache";
import { cacheConfig } from "@app/config";

interface AppCache extends CacheOptions {
  disabled?: boolean;
}

// Remove properties to prevent node-cache future side-effects
function _extractValidNodeCacheOptions(options: AppCache): CacheOptions {
  return Object.keys(options).reduce((object, key) => {
    if (key !== "disabled") {
      object[key] = options[key];
    }
    return object;
  }, {});
}

const appCache = new NodeCache(_extractValidNodeCacheOptions(cacheConfig));

function configureCacheControl(options: AppCache) {
  if ("disabled" in options) {
    cacheConfig.disabled = !!options.disabled;
  }
  appCache.options = Object.assign(
    {},
    appCache.options,
    _extractValidNodeCacheOptions(options)
  );
}

export { appCache, configureCacheControl };
