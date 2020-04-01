const isUrl = require("is-url");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");
const fetch = require("isomorphic-unfetch");

const { WEBSITE_NOT_FOUND_TEMPLATE } = require("./templates/not-found");
const { stdTTL, headers } = require("./config");

const cache = new NodeCache({ stdTTL });

// Experimental manipulation
// function manipulateSource(i, src, url) {
//   if (src) {
//     if (!src.includes(url)) {
//       const newSrc = src.replace(/^[/]+/, "");
//       src = `${newSrc.includes("http") ? "" : url + "/"}` + newSrc;
//     }
//     return src;
//   }
//   return null;
// }

async function renderHtml({ url, baseHref }) {
  const cachedHtml = await cache.get(url);

  if (cachedHtml) {
    return cheerio.load(cachedHtml);
  }

  if (isUrl(url)) {
    try {
      const response = await fetch(url, {
        uri: url,
        headers
      });
      const html = await response.text();
      const $html = cheerio.load(html);
      // response.headers.has('access-control-allow-origin')

      if ($html) {
        $html("head").prepend(`<base target="_self" href="${url}">`);
        if (typeof baseHref !== "undefined" && baseHref !== "false") {
          $html("script").attr("crossorigin", "anonymous");
          // $html('script').attr('src', (i, src) =>
          //   manipulateSource(i, src, url)
          // )
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
    } catch (fetchError) {
      console.log(fetchError);
    }
  }

  return false;
}

function createIframe(req, res, next) {
  res.createIframe = async model => {
    const error_template = () =>
      res.status(400).send(WEBSITE_NOT_FOUND_TEMPLATE);

    if (!model.url) {
      error_template();
    }

    try {
      const $html = await renderHtml(model);

      if ($html && typeof $html.html === "function") {
        // inject footer height of the navigation bar
        $html("body").append(
          `<span style="height: 64px; display: block;" /><span>`
        );
        res.status(200).send($html.html());
      } else {
        error_template();
      }
    } catch (er) {
      console.log(er);
      error_template();
    }
  };

  next();
}

module.exports = createIframe;
