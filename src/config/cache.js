const stdTTL =
  typeof process !== "undefined" &&
  process &&
  process.env &&
  process.env.NODE_ENV !== "production"
    ? 30
    : 600;

module.exports = {
  stdTTL
};
