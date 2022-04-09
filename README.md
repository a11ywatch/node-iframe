# node-iframe

[![j-mendez](https://circleci.com/gh/j-mendez/node-iframe.svg?style=svg)](https://circleci.com/gh/j-mendez/node-iframe)

create iframes to bypass security issues on your server with node.js can also be used on the client

## Installation

`npm install node-iframe`

## How to use

as express middleware

```typescript
import createIframe from "node-iframe";
// or
// const createIframe = require("node-iframe").default;

app.use(createIframe);

app.get("/iframe", (req, res) => {
  res.createIframe({
    url: req.query.url,
    baseHref: req.query.baseHref, // optional: determine how to control link redirects,
    config: { cors: { script: true } }, // optional: determine element cors or inlining #shape src/iframe.ts#L34
  });
});
```

On the client use directly in your iframe if your api is on the same server set the url below like this or if your using a framework like gatsby, nextjs, etc or non-express apps

```html
<iframe src="/iframe/?url=https://www.etsy.com" />
```

You can even fetch the iframe directly by importing `fetchFrame` on the client or server.

```typescript
const { fetchFrame } = require("node-iframe");

async function fetchIframe() {
  return await fetchFrame({ url: "https://www.etsy.com" });
}
```

Configure how to handle resources for all request

```typescript
const { configureResourceControl, configureTemplates } = require("node-iframe");

// optional: configure if elements should be inlined, cors, etc, this combines with the `config` param
configureResourceControl({
  inline: { script: true, link: false },
  cors: { script: true },
});
// optional: configure error-pages - check src/templates for more info
// 0: error, 1: not-found, 2: all templates - check src/templates/config for options
configureTemplates("<div>No Fish found</div>", 1);
```

[Example](https://www.a11ywatch.com/testout)

## License

MIT
