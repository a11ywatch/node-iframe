const defaultInlineConfig = {
  script: false,
};

const defaultCorsConfig: {
  script: boolean | string;
  link: boolean | string;
  img: boolean | string;
  audio: boolean | string;
  video: boolean | string;
} = {
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
