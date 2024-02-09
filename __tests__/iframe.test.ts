import { load } from "cheerio";
import { fetchFrame, configureResourceControl } from "@app/iframe";
import { WEBSITE_NOT_FOUND_TEMPLATE } from "@app/templates";
import { fetchWithTimestamps, TimeStampMetrics } from "@app/utils";

const url = process.env.API_URL || "https://www.drake.com";

describe("iframe render", () => {
  const requestTimeStamps: TimeStampMetrics[] = [];
  const notFoundPage = load(WEBSITE_NOT_FOUND_TEMPLATE).html();
  configureResourceControl({
    inline: { script: true },
    cors: { script: true },
  });

  test("is from external source", async () => {
    const { res, t0, t1 } = await fetchWithTimestamps({ url });

    requestTimeStamps.push({ t0, t1 });
    
    expect(res).not.toBe(notFoundPage);
  });

  // TODO: move to http cache and batch into single test
  test.skip("is cached", async () => {
    const { t0, t1 } = await fetchWithTimestamps({ url });

    requestTimeStamps.push({ t0, t1 });

    expect(t1 - t0).toBeLessThanOrEqual(
      requestTimeStamps[0].t1 - requestTimeStamps[0].t0
    );
  });

  test("is not found error", async () => {
    const res = await fetchFrame({ url: `/iframe?url=${url}` });

    expect(res).toBe(notFoundPage);
  });
});
