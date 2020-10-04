import isUrl from "is-url";
import fetch from "isomorphic-unfetch";
import { load } from "cheerio";

import {
  configureTemplates,
  templateModel,
  TemplateType,
} from "@app/templates";
import { headers } from "@app/config";
import { appCache, configureCacheControl } from "@app/cache";

// NOTE: needs control type like wappalyzer for usage only on websites that use specefic frameworks like old versions of react, angular, vue, and etc
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

function renderErrorHtml({ url, server, noPage = false }) {
  return Object.assign(
    load(
      !url
        ? templateModel[TemplateType.error]
        : templateModel[TemplateType.notFound]
    ),
    server ? { status: Number(`${40}${!url || noPage ? 4 : 0}`) } : {}
  );
}

async function renderHtml({ url, baseHref }, server = false) {
  if (!isUrl(url)) {
    return renderErrorHtml({ url, server });
  }
  try {
    const cachedHtml = await appCache.get(url);
    if (cachedHtml) {
      return load(cachedHtml);
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
    const $html = load(html);

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

    if (server) {
      $html.status = 200;
    }

    return $html;
  } catch (e) {
    console.error(e);
  }

  return renderErrorHtml({ url, server, noPage: true });
}

function createIframe(req, res, next) {
  res.createIframe = async (model) => {
    const $html = await renderHtml(model, true);
    res.status($html?.status || 200).send($html.html());
  };

  next();
}

export async function fetchFrame(model) {
  const $html = await renderHtml(model, typeof process !== "undefined");
  return $html?.html();
}

export { configureTemplates, configureCacheControl };
export default createIframe;
