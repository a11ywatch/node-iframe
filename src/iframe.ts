import fetch from "isomorphic-unfetch";
import { load } from "cheerio";
import { isUrl } from "./utils";

import {
  configureTemplates,
  templateModel,
  TemplateType,
} from "@app/templates";
import {
  defaultConfig,
  defaultCorsConfig,
  defaultInlineConfig,
  appHeaders,
} from "@app/config";

type CorsResourceType = "anonymous" | "use-credentials" | boolean;

interface InlineElementsConfig {
  script?: boolean;
}

interface CorsElementsConfig {
  audio?: CorsResourceType;
  link?: CorsResourceType;
  img?: CorsResourceType;
  script?: CorsResourceType;
  video?: CorsResourceType;
}

interface RenderHtmlConfig {
  inline?: InlineElementsConfig;
  cors?: CorsElementsConfig;
}

let appSourceConfig = defaultConfig;

let httpAgent;
let httpsAgent;

let agentConfigured = false;

const agent = agentConfigured
  ? (_parsedURL) => {
      if (_parsedURL.protocol == "http:" && setAgent(true)) {
        return httpAgent;
      } else if (setAgent(false)) {
        setAgent(false);
        return httpsAgent;
      }
    }
  : undefined;

// run agent top level setter
function setAgent(http: boolean): boolean {
  try {
    if (http && !httpAgent) {
      const transport = require("http");
      httpAgent = new transport.Agent({
        rejectUnauthorized: false,
      });
    } else if (!httpsAgent) {
      const transport = require("https");
      httpsAgent = new transport.Agent({
        rejectUnauthorized: false,
      });
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// configure http agent usage
function configureAgent() {
  if (!agentConfigured) {
    // @ts-ignore
    if (typeof window === "undefined" && !agentConfigured) {
      agentConfigured = true;
    }
  }
}

// NOTE: control type like wappalyzer for usage only on websites that use specefic frameworks like old versions of react, angular, vue, and etc
const mutateSource = async ({ src = "", key }, url, $html, headers) => {
  if (src && src[0] === "/") {
    try {
      const res = await fetch(`${url}/${src}`, {
        headers,
        agent,
      });

      if (res && res.ok) {
        const source = await res.text();
        await $html(key).html(source);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

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

async function renderHtml(
  { url, baseHref, config, head = {} },
  server = false
) {
  if (!isUrl(url)) {
    return renderErrorHtml({ url, server });
  }

  const { inline, cors } = {
    inline: {
      ...appSourceConfig.inline,
      ...config?.inline,
    },
    cors: {
      ...appSourceConfig.cors,
      ...config?.cors,
    },
  };

  const headers = { ...appHeaders, ...head };

  let response;

  try {
    response = await fetch(url, {
      headers: head,
      agent,
    });
  } catch (e) {
    console.error(e);
  }

  if (response && response.ok) {
    try {
      const html = await response.text();

      if (!html) {
        return renderErrorHtml({ url, server, noPage: true });
      }
      const $html = load(html);

      // BASE TARGET FOR RESOURCES
      if (!!baseHref) {
        $html("head").prepend(`<base target="_self" href="${url}">`);
      }

      const inlineMutations: {
        key: string;
        src: string;
        attribute: string;
      }[] = [];

      // GATHER INLINE ELEMENTS
      for (const key of Object.keys(inline)) {
        if (inline[key]) {
          const attribute = "src";
          $html(key).attr(attribute, function (_, src) {
            if (src) {
              inlineMutations.push({ key, attribute, src: src + "" });
            }
            return src;
          });
        }
      }

      // MUTATE INLINE ELEMENTS
      for (const com of inlineMutations) {
        const { key, attribute, src } = com;
        const element = `${key}[${attribute}="${src}"]`;
        await mutateSource({ key: element, src }, url, $html, headers);
        $html(element).removeAttr(attribute);
      }

      $html(`[src="undefined"]`).removeAttr("src");

      // CORS ELEMENTS
      for (const key of Object.keys(cors)) {
        if (cors[key]) {
          $html(key).attr("crossorigin", cors[key]);
        }
      }

      return $html;
    } catch (e) {
      console.error(e);
    }
  }

  return renderErrorHtml({ url, server, noPage: true });
}

async function fetchFrame(model) {
  try {
    const $html = await renderHtml(model, typeof process !== "undefined");
    return $html?.html();
  } catch (e) {
    console.error(e);
  }
}

function configureResourceControl(appConfig: RenderHtmlConfig) {
  appSourceConfig = Object.assign({}, defaultConfig, {
    cors: {
      ...defaultCorsConfig,
      ...appConfig?.cors,
    },
    inline: { ...defaultInlineConfig, ...appConfig?.inline },
  });
}

/**
 * Create an iframe middleware with express.
 * @example
 * // sets up middleware for use.
 * app.use(createIframe);
 * @returns {void} Returns reverse engineered iframe that can be used across domains.
 */
function createIframe(_req, res, next) {
  res.createIframe = async (model) => {
    try {
      const $html = await renderHtml(model, true);

      if ($html) {
        res.status(200).send($html.html());
      }
    } catch (e) {
      console.error(e);
    }
  };

  next();
}

export {
  appSourceConfig,
  configureAgent,
  configureResourceControl,
  configureTemplates,
  fetchFrame,
};
export default createIframe;
