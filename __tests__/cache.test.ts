import { appCache, configureCacheControl } from "@app/cache";
import { fetchFrame } from "@app/iframe";
import { url, cacheConfig } from "@app/config";

describe("cache control", () => {
  test("can configure cache options", () => {
    configureCacheControl({ stdTTL: 0 });
    expect(appCache.options.stdTTL).toBe(0);
  });

  test("is in cache storage", async () => {
    const res = await fetchFrame({ url });

    expect(res).toBe(appCache.data[url].v);
  });

  test("can disable cache to reduce memory used and operations", () => {
    configureCacheControl({ disabled: true });

    expect(appCache).toStrictEqual(undefined);
  });
});
