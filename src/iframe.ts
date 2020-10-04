import isUrl from "is-url";
import fetch from "isomorphic-unfetch";
import { load } from "cheerio";

import {
  configureTemplates,
  templateModel,
  TemplateType,
} from "@app/templates";
import {
  defaultConfig,
  defaultCorsConfig,
  defaultInlineConfig,
  headers,
  cacheConfig,
} from "@app/config";
import { appCache, configureCacheControl } from "@app/cache";

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

interface RenderHtmlSource {
  url?: string;
  baseHref?: string | boolean;
  config?: RenderHtmlConfig;
}

type HtmlSource = {
  html(): string;
  status?: number;
};

type RenderHtml = (source: RenderHtmlSource, server?: boolean) => HtmlSource;

type RenderHtmlError = (source: {
  url?: string;
  server?: boolean;
  noPage?: boolean;
}) => HtmlSource;

let appSourceConfig = defaultConfig;

// NOTE: control type like wappalyzer for usage only on websites that use specefic frameworks like old versions of react, angular, vue, and etc
const mutateSource = async ({ src = "", key }, url, $html) => {
  if (src && src[0] === "/") {
    try {
      const res = await fetch(`${url}/${src}`, {
        headers,
      });
      const source = await res.text();
      await $html(key).html(source);
    } catch (e) {
      console.error(e);
    }
  }
};

function renderErrorHtml<RenderHtmlError>({ url, server, noPage = false }) {
  return Object.assign(
    load(
      !url
        ? templateModel[TemplateType.error]
        : templateModel[TemplateType.notFound]
    ),
    server ? { status: Number(`${40}${!url || noPage ? 4 : 0}`) } : {}
  );
}

async function renderHtml<RenderHtml>(
  { url, baseHref, config },
  server = false
) {
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

  try {
    const response = await fetch(url, {
      headers,
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
      await mutateSource({ key: element, src }, url, $html);
      await $html(element).removeAttr(attribute);
    }

    await $html(`[src="undefined"]`).removeAttr("src");

    // CORS ELEMENTS
    for await (const key of Object.keys(cors)) {
      if (cors[key]) {
        await $html(key).attr("crossorigin", cors[key]);
      }
    }

    appCache.set(url, $html.html());

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

function createIframe(req, res, next) {
  res.createIframe = async (model) => {
    const $html = await renderHtml(model, true);
    res.status($html?.status || 200).send($html.html());
  };

  next();
}

export {
  appSourceConfig,
  configureResourceControl,
  configureTemplates,
  configureCacheControl,
  fetchFrame,
};
export default createIframe;
