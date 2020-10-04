import { load } from "cheerio";
import { createServer } from "http";
import fetch from "isomorphic-unfetch";
import { fetchFrame } from "@app/iframe";
import { url } from "@app/config";
import { WEBSITE_NOT_FOUND_TEMPLATE } from "@app/templates";
import { parse as urlParse } from "url";

describe("api", () => {
  let server;
  beforeAll(async () => {
    server = createServer(async function (req, res) {
      const { pathname, query } = urlParse(req.url + "", true);
      const { url } = query;

      if (pathname === "/iframe") {
        const data = await fetchFrame({ url });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      }
    }).listen(0);
  });

  test("is from api", async () => {
    try {
      const res = await fetch(
        `http://localhost:${server.address().port}/iframe?url=${url}`
      );
      const data = await res.text();
      const notFoundPage = load(WEBSITE_NOT_FOUND_TEMPLATE).html();

      expect(res).not.toBe(notFoundPage);
    } catch (e) {
      console.error(e);
    } finally {
      await server.close();
    }
  });

  test.todo("add express api usage");
});
