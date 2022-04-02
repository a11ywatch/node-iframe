let URL;

try {
  // @ts-ignore
  if (typeof window !== "undefined") {
    // @ts-ignore
    URL = window.URL;
  } else {
    URL = require("url").URL;
  }
} catch (e) {
  console.error(e);
}

export { URL };
