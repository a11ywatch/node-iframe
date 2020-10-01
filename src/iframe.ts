import isUrl from "is-url";
import cheerio from "cheerio";
// @ts-ignore
import fetch from "isomorphic-unfetch";

import { WEBSITE_NOT_FOUND_TEMPLATE } from "@app/templates/not-found";
import { headers } from "@app/config";
import { appCache, configureCacheControl } from "@app/cache";

// Experimental manipulation NOTE: needs control type like wappalyzer
function manipulateSource(i, src, url, $html) {
  if (src) {
    const trailing = src && src[0] === "/";

    if (trailing) {
      try {
        void (async function grabData() {
          const pathUrl = `${url}${trailing ? "" : "/"}${src}`;

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
    const cachedHtml = await appCache.get(url);

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
      appCache.set(url, $html.html());
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
    try {
      if (!model.url) {
        renderError(res);
      }
      const $html = await renderHtml(model);

      if ($html && typeof $html?.html === "function") {
        res.status(200).send($html.html());
      } else {
        renderError(res);
      }
    } catch (e) {
      console.error(e);
      renderError(res);
    }
  };

  next();
}

export async function fetchFrame(model) {
  try {
    if (model?.url) {
      const $html = await renderHtml(model);
      return $html?.html() || WEBSITE_NOT_FOUND_TEMPLATE;
    }
    return WEBSITE_NOT_FOUND_TEMPLATE;
  } catch (e) {
    console.error(e);
    return WEBSITE_NOT_FOUND_TEMPLATE;
  }
}

export { configureCacheControl };
export default createIframe;
