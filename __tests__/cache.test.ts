import { appCache, configureCacheControl } from "@app/cache";
import { fetchFrame } from "@app/iframe";
import { url } from "@app/config";

test("configures app cache options properly", async () => {
  configureCacheControl({ stdTTL: 0 });
  return expect(appCache.options.stdTTL).toBe(0);
});

test("iframe stores page cached properly", async () => {
  const res = await fetchFrame({ url });

  return expect(res).toBe(appCache.data[url].v);
});
