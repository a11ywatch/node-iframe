let fetcher: // @ts-ignore
| typeof global.fetch
  | ((url: string, options: Record<string, unknown>) => Promise<string>);

if (!fetcher) {
  
  (async () => {
    if (process) {
      const followRedirects = require('follow-redirects');
      followRedirects.maxRedirects = 4;
      const http = followRedirects.http;
      const https = followRedirects.https;

      const getHttp = (url: string) =>
        url.startsWith("https://") ? https : http;

      const get = (
        url: string,
        options?: {
          headers?: Record<string, any>;
          agent?: string | (() => string);
        }
      ) => {
        const { agent, headers } = options ?? {};
        let fetchOptions = {};

        if (typeof agent !== "undefined") {
          if (typeof agent === "function") {
            const ua = agent();
            if (typeof ua !== "undefined") {
              fetchOptions = { agent: ua };
            }
          } else {
            fetchOptions = { agent };
          }
        }

        if (typeof headers !== "undefined") {
          fetchOptions = { ...fetchOptions, headers };
        }

        const httpMethod = getHttp(url);

        return new Promise((resolve, reject) => {
          let body = "";

          httpMethod
            .get(url, fetchOptions, (res) => {
              res.setEncoding("utf8");

              res.on("data", (d) => {
                body += d;
              });
              res.on("end", function () {
                resolve(body);
              });
            })
            .on("error", (e) => {
              console.error(e);
              reject(e);
            });
        });
      };

      fetcher = get;
    } else {
      // @ts-ignore
      fetcher = global.fetch;
    }
  })();
}

export { fetcher };
