import { appCache, configureCacheControl } from "@app/cache";

test("configures app cache options properly", async () => {
  configureCacheControl({ stdTTL: 0 });
  return expect(appCache.options.stdTTL).toBe(0);
});
