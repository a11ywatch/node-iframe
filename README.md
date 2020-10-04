# node-iframe

[![A11yWatch](https://circleci.com/gh/A11yWatch/node-iframe.svg?style=svg)](https://circleci.com/gh/A11yWatch/node-iframe)

create iframes to bypass security issues on your server with node.js can also be used on the client

## Installation

`npm install node-iframe` or `yarn add node-iframe`

## How to use

On your server

```typescript
const createIframe = require("node-iframe");

app.use(createIframe);

app.get("/iframe", (req, res) =>
  res.createIframe({
    url: req.query.url,
    baseHref: req.query.baseHref, // optional,
  })
);
```

On the client use directly in your iframe if your api is on the same server set the url below like this or if your using a framework like gatsby, nextjs, etc

```html
<iframe src="/iframe/?url=https://www.etsy.com" />
```

You can even fetch the iframe directly by importing fetchFrame on the client or server.

```typescript
const {
  fetchFrame,
  configureCacheControl,
  configureTemplates,
} = require("node-iframe");

// optional: configure cache-control, to disable cache set `disabled` to true - check https://github.com/node-cache/node-cache#options
// for more options and info
configureCacheControl({ stdTTL: 0, checkperiod: 600, disabled: false });

// optional: configure error-pages - check src/templates for more info
// 0: error, 1: not-found, 2: all templates - check src/templates/config for options
configureTemplates("<div>No Fish found</div>", 1);

async function fetchIframe() {
  return await fetchFrame("/iframe/?url=https://www.etsy.com");
}
```

[Example](https://www.a11ywatch.com/testout)

## Params

Node iframe has one param Object with a `url` prop that is the url of the website and `baseHref` is optional property that will inject crossorigin="anonymous" onto all your script tags.

## About

This project uses cheerio to manipulate html very fast. If your iframe fails to render thats where the security issues need to be reverse hacked by us using this project. As an alternative solution if the iframe fails to load simply fall back to the normal url of web page. You can fire this as an api request directly with `fetch` to get the website as html or use directly as your iframe src for best performance.

## License

MIT
