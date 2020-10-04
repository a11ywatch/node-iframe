import type NodeCache from "node-cache";
import type { Options, Data } from "node-cache";
import { cacheConfig } from "@app/config";

interface AppCache extends Options {
  disabled?: boolean;
}

const model = {
  get(_): string | undefined {
    return;
  },
  set(_, __): void {},
  options: {} as Options,
  data: {} as Data,
};

let appCache = model;

function createCache(): void {
  if (!cacheConfig.disabled) {
    const Cache = require("node-cache");
    appCache = new Cache(appCache?.options || cacheConfig) as NodeCache;
  }
}

function configureCacheControl(options: AppCache) {
  if ("disabled" in options) {
    if (options.disabled) {
      appCache = model;
    }
    const enableCache = cacheConfig.disabled && !options.disabled;
    cacheConfig.disabled = !!options.disabled;
    enableCache && createCache();
  }

  if (!cacheConfig.disabled) {
    appCache.options = Object.assign({}, appCache?.options, options);
  }
}

createCache();

export { appCache, configureCacheControl };
