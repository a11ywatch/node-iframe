# Node iframe

create iframes to bypass security issues on your server with node js

## Installation

`yarn install node-iframe`

## How to use

```typescript
const createIframe = require("node-iframe");

app.use(createIframe);

app.get("/iframe", (req, res) =>
  res.createIframe({
    sourceUrl: req.query.url,
    baseHref: req.query.baseHref || true
  })
);
```

## Params

Node iframe has one param Object with a `sourceUrl` prop that is the url of the website and `baseHref` is optional property that will inject crossorigin="anonymous" onto all your script tags.

## About

This project uses cheerio to manipulate dom contents very fast
