const isUrl = require("is-url");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");

const { WEBSITE_NOT_FOUND_TEMPLATE } = require("./templates/not-found");
const { stdTTL, headers } = require("./config");

const cache = new NodeCache({ stdTTL });

// Experimental manipulation
// function manipulateSource(i, src, sourceUrl) {
//   if (src) {
//     if (!src.includes(sourceUrl)) {
//       const newSrc = src.replace(/^[/]+/, "");
//       src = `${newSrc.includes("http") ? "" : sourceUrl + "/"}` + newSrc;
//     }
//     return src;
//   }
//   return null;
// }

async function renderHtml({ sourceUrl, baseHref }) {
  const cachedHtml = await cache.get(sourceUrl);

  if (cachedHtml) {
    return cheerio.load(cachedHtml);
  }

  if (isUrl(sourceUrl)) {
    try {
      const response = await fetch(sourceUrl, {
        uri: sourceUrl,
        headers
      });
      const html = await response.text();
      const $html = cheerio.load(html);
      // response.headers.has('access-control-allow-origin')

      if ($html) {
        $html("head").prepend(`<base target="_self" href="${sourceUrl}">`);
        if (typeof baseHref !== "undefined" && baseHref !== "false") {
          $html("script").attr("crossorigin", "anonymous");
          // $html('script').attr('src', (i, src) =>
          //   manipulateSource(i, src, sourceUrl)
          // )
          // $html('link').attr('href', (i, src) =>
          //   manipulateSource(i, src, sourceUrl)
          // )
        }
        // create or inject scripts here to bypass security issues by reverse engineering
        // $html('head').prepend(`<script async>
        // console.trace();
        // </script>`)
        cache.set(sourceUrl, $html.html());
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

    if (!model.sourceUrl) {
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
