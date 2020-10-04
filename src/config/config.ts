const url =
  process.env.API_URL ||
  (process.env.NODE_ENV === "test" ? "https://www.drake.com" : "");

const defaultInlineConfig = {
  script: false,
};

const defaultCorsConfig = {
  script: false,
  link: false,
  img: false,
  audio: false,
  video: false,
};

const defaultConfig = {
  inline: defaultInlineConfig,
  cors: defaultCorsConfig,
};

export { defaultConfig, defaultCorsConfig, defaultInlineConfig, url };
