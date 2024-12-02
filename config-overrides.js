module.exports = function override(config) {
  config.resolve.fallback = {
    fs: false,
    path: require.resolve("path-browserify"),
    crypto: false,
    stream: false,
    util: false,
    vm: false,
    process: false,
  };

  return config;
};
