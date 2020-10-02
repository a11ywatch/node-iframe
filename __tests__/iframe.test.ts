import { fetchFrame } from "@app/iframe";
import { WEBSITE_NOT_FOUND_TEMPLATE } from "@app/templates";
import { appCache } from "@app/cache";
import { url } from "@app/config";
import { fetchWithTimestamps } from "@app/utils";

test("iframe renders properly", async () => {
  const res = await fetchFrame({ url });

  return expect(res).not.toBe(WEBSITE_NOT_FOUND_TEMPLATE);
});

test("iframe renders properly cached under 100ms", async () => {
  const { res, t0, t1 } = await fetchWithTimestamps({ url });

  return expect(t1 - t0).toBeLessThanOrEqual(100);
});

test("error page renders properly", async () => {
  const res = await fetchFrame({ url: `/iframe?url=${url}` });

  return expect(res).toBe(WEBSITE_NOT_FOUND_TEMPLATE);
});
