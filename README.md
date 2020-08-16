# Node Iframe

create iframes to bypass security issues on your server with node.js

## Installation

`yarn install node-iframe`

## How to use

On your server

```typescript
const createIframe = require("node-iframe");

app.use(createIframe);

app.get("/iframe", (req, res) =>
  res.createIframe({
    url: req.query.url,
    baseHref: req.query.baseHref || true,
  })
);
```

On the client use directly in your iframe if your api is on the same server set the url below like this or if your using a framework like gatsby, nextjs, etc

```html
<iframe src="/iframe/?url=https://www.etsy.com" />
```

You can even fetch the iframe directly on the content if needed.

```typescript
const { fetchFrame } = require("node-iframe");

async function fetchIframe() {
  return await fetchFrame("/iframe/?url=https://www.etsy.com");
}
```

[Example](https://www.a11ywatch.com/testout)

Screenshot above is an example image of the package used at [A11ywatch](https://www.a11ywatch.com)

## Params

Node iframe has one param Object with a `url` prop that is the url of the website and `baseHref` is optional property that will inject crossorigin="anonymous" onto all your script tags.

## About

This project uses cheerio to manipulate dom contents very fast. If your iframe fails to render thats where the security issues need to be reverse hacked by us. As an alternative solution if the iframe fails to load simply fall back to the normal url of web page. You can fire this as an api request directly with `fetch` to get the website as html or use directly as your iframe src for best perfomance.
