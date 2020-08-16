import isUrl from "is-url";
import cheerio from "cheerio";
import NodeCache from "node-cache";
// @ts-ignore
import fetch from "isomorphic-unfetch";

import { WEBSITE_NOT_FOUND_TEMPLATE } from "./templates/not-found";
import { stdTTL, checkperiod, headers } from "./config";

const cache = new NodeCache({ stdTTL, checkperiod });

// Experimental manipulation
function manipulateSource(i, src, url, $html) {
  if (src) {
    const isSlash = src && src[0] === "/";

    if (isSlash) {
      try {
        void (async function grabData() {
          const pathUrl = `${url}${isSlash ? "" : "/"}${src}`;

          const scriptCode = await fetch(pathUrl, {
            uri: pathUrl,
            headers,
          });

          const scriptText = await scriptCode.text();

          $html(`script[src="${src}"]`).html(scriptText);
        })();
      } catch (e) {
        console.error(e);
      }
    }

    return src;
  }
  return null;
}

async function renderHtml({ url, baseHref }) {
  if (!isUrl(url)) {
    return null;
  }

  try {
    const cachedHtml = await cache.get(url);

    if (cachedHtml) {
      return cheerio.load(cachedHtml);
    }
  } catch (e) {
    console.error(e);
  }

  try {
    const response = await fetch(url, {
      uri: url,
      headers,
    });
    const html = await response.text();
    const $html = cheerio.load(html);

    if ($html) {
      $html("head").prepend(`<base target="_self" href="${url}">`);

      if (typeof baseHref !== "undefined" && baseHref !== "false") {
        // $html('script').attr('crossorigin', 'anonymous')
        $html("script").attr("src", (i, src) =>
          manipulateSource(i, src, url, $html)
        );
        // $html('link').attr('href', (i, src) =>
        //   manipulateSource(i, src, url)
        // )
      }
      // create or inject scripts here to bypass security issues by reverse engineering
      // $html('head').prepend(`<script async>
      // console.trace();
      // </script>`)
      cache.set(url, $html.html());
    }

    return $html;
  } catch (e) {
    console.error(e);
  }

  return false;
}

const renderError = (res) => res.status(400).send(WEBSITE_NOT_FOUND_TEMPLATE);

function createIframe(req, res, next) {
  res.createIframe = async (model) => {
    if (!model.url) {
      renderError(res);
    }
    try {
      const $html = await renderHtml(model);

      if ($html && typeof $html.html === "function") {
        res.status(200).send($html.html());
      } else {
        renderError(res);
      }
    } catch (er) {
      console.error(er);
      renderError(res);
    }
  };

  next();
}

export async function fetchFrame(model) {
  if (!model.url) {
    return WEBSITE_NOT_FOUND_TEMPLATE;
  }
  try {
    const $html = await renderHtml(model);
    if ($html && typeof $html.html === "function") {
      return $html.html();
    } else {
      return WEBSITE_NOT_FOUND_TEMPLATE;
    }
  } catch (er) {
    console.error(er);
    return WEBSITE_NOT_FOUND_TEMPLATE;
  }
}

export default createIframe;
