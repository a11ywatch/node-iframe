let fetcher: // @ts-ignore
| typeof global.fetch
  | ((url: string, options: Record<string, unknown>) => Promise<string>);

let https;
let http;

if (!fetcher) {
  (async () => {
    if (process) {
      // load https module
      if (!https) {
        try {
          https = await import("https");
        } catch (e) {
          console.error("https support is disabled!");
        }
      }

      // load http modules
      if (!http) {
        try {
          http = await import("http");
        } catch (e) {
          console.error("http support is disabled!");
        }
      }

      const getHttp = (url: string) =>
        url.startsWith("https://") ? https : http;

      const get = (
        url: string,
        options?: {
          headers?: Record<string, any>;
          agent?: string | (() => string);
        },
        retry?: number
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
              if((res.statusCode === 301 || res.statusCode === 302) && retry) {
                return get(res.headers.location, options, --retry)      
              }
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
