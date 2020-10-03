import { appCache, configureCacheControl } from "@app/cache";
import { fetchFrame } from "@app/iframe";
import { url } from "@app/config";

describe("cache control", () => {
  test("can configure cache options", async () => {
    configureCacheControl({ stdTTL: 0 });
    return expect(appCache.options.stdTTL).toBe(0);
  });

  test("is in cache storange", async () => {
    const res = await fetchFrame({ url });

    return expect(res).toBe(appCache.data[url].v);
  });
});
