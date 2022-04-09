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
    try {
      // @ts-ignore
      if (typeof window === "undefined" && !agentConfigured) {
        agentConfigured = true;
      }
    } catch (e) {
      console.error(e);
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
      const source = await res.text();
      await $html(key).html(source);
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

  try {
    const response = await fetch(url, {
      headers: head,
      agent,
    });
    const html = await response.text();
    const $html = load(html);

    // BASE TARGET FOR RESOURCES
    if (!!baseHref) {
      await $html("head").prepend(`<base target="_self" href="${url}">`);
    }

    const inlineMutations: {
      key: string;
      src: string;
      attribute: string;
    }[] = [];

    // GATHER INLINE ELEMENTS
    for await (const key of Object.keys(inline)) {
      if (inline[key]) {
        const attribute = "src";
        await $html(key).attr(attribute, function (_, src) {
          if (src) {
            inlineMutations.push({ key, attribute, src });
          }
          return src;
        });
      }
    }

    // MUTATE INLINE ELEMENTS
    for await (const com of inlineMutations) {
      const { key, attribute, src } = com;
      const element = `${key}[${attribute}="${src}"]`;
      await mutateSource({ key: element, src }, url, $html, headers);
      await $html(element).removeAttr(attribute);
    }

    await $html(`[src="undefined"]`).removeAttr("src");

    // CORS ELEMENTS
    for await (const key of Object.keys(cors)) {
      if (cors[key]) {
        await $html(key).attr("crossorigin", cors[key]);
      }
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

async function fetchFrame(model) {
  const $html = await renderHtml(model, typeof process !== "undefined");
  return $html?.html();
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

function createIframe(_req, res, next) {
  res.createIframe = async (model) => {
    const $html = await renderHtml(model, true);
    res.status($html?.status || 200).send($html.html());
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
