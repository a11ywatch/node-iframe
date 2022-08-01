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

export { defaultConfig, defaultCorsConfig, defaultInlineConfig };
