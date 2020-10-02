import { fetchFrame } from "@app/iframe";
import { WEBSITE_NOT_FOUND_TEMPLATE } from "@app/templates";
import { appCache } from "@app/cache";
import { url } from "@app/config";
import { fetchWithTimestamps, TimeStampMetrics } from "@app/utils";

const requestTimeStamps: TimeStampMetrics[] = [];

describe("rendering", () => {
  test("iframe renders properly", async () => {
    const { res, t0, t1 } = await fetchWithTimestamps({ url });

    requestTimeStamps.push({ t0, t1 });

    return expect(res).not.toBe(WEBSITE_NOT_FOUND_TEMPLATE);
  });

  test("iframe renders cached properly", async () => {
    const { res, t0, t1 } = await fetchWithTimestamps({ url });

    return expect(t1 - t0).toBeLessThan(
      (requestTimeStamps[0].t1 - requestTimeStamps[0].t0) / 2
    );
  });

  test("error page renders properly", async () => {
    const res = await fetchFrame({ url: `/iframe?url=${url}` });

    return expect(res).toBe(WEBSITE_NOT_FOUND_TEMPLATE);
  });
});
