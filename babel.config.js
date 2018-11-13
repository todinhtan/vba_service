/* eslint-disable semi */
/* eslint-disable eol-last */
/* eslint-disable func-names */
module.exports = function (api) {
  const presets = ['@babel/env'];
  const plugins = ['@babel/plugin-transform-runtime'];
  api.cache.never();

  return {
    presets,
    plugins,
  };
}