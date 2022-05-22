let URL;

try {
  if (typeof process === "undefined") {
    // @ts-ignore
    URL = window.URL;
  } else {
    URL = require("url").URL;
  }
} catch (e) {
  console.error(e);
}

export { URL };
