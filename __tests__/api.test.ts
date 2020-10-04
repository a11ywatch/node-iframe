import { load } from "cheerio";
import { createServer } from "http";
import fetch from "isomorphic-unfetch";

import createIframe from "@app/iframe";
import { fetchFrame } from "@app/iframe";
import { url } from "@app/config";
import { WEBSITE_NOT_FOUND_TEMPLATE } from "@app/templates";
import { parse as urlParse } from "url";
import express from "express";

describe("api", () => {
  const notFoundPage = load(WEBSITE_NOT_FOUND_TEMPLATE).html();
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

      expect(res).not.toBe(notFoundPage);
    } catch (e) {
      console.error(e);
    } finally {
      await server.close();
    }
  });

  describe("express", () => {
    beforeAll(() => {
      const app = express();
      app.use(createIframe);

      app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        next();
      });

      app.get("/iframe", (req, res) => {
        res.createIframe({
          url: decodeURI(req.query.url + ""),
          baseHref: !!req.query.baseHref,
        });
      });

      server = app.listen(0);
    });

    test("is from express", async () => {
      try {
        const res = await fetch(
          `http://localhost:${server.address().port}/iframe?url=${url}`
        );
        const data = await res.text();

        expect(res).not.toBe(notFoundPage);
      } catch (e) {
        console.error(e);
      } finally {
        await server.close();
      }
    });
  });
});
