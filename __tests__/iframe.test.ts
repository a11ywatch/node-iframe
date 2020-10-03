import { load } from "cheerio";

import { fetchFrame } from "@app/iframe";
import { WEBSITE_NOT_FOUND_TEMPLATE } from "@app/templates";
import { appCache } from "@app/cache";
import { url } from "@app/config";
import { fetchWithTimestamps, TimeStampMetrics } from "@app/utils";

const requestTimeStamps: TimeStampMetrics[] = [];
const notFoundPage = load(WEBSITE_NOT_FOUND_TEMPLATE).html();

describe("iframe render", () => {
  test("is from external source", async () => {
    const { res, t0, t1 } = await fetchWithTimestamps({ url });

    requestTimeStamps.push({ t0, t1 });

    return expect(res).not.toBe(notFoundPage);
  });

  test("is cached", async () => {
    const { res, t0, t1 } = await fetchWithTimestamps({ url });

    return expect(t1 - t0).toBeLessThanOrEqual(
      (requestTimeStamps[0].t1 - requestTimeStamps[0].t0) / 2
    );
  });

  test("is not found error", async () => {
    const res = await fetchFrame({ url: `/iframe?url=${url}` });

    return expect(res).toBe(notFoundPage);
  });
});
