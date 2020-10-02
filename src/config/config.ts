export const url =
  process.env.API_URL ||
  (process.env.NODE_ENV === "test" ? "https://www.drake.com" : "");
