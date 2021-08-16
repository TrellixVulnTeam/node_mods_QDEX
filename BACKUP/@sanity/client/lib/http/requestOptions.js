"use strict";

var assign = require("object-assign");

var projectHeader = "X-Sanity-Project-ID";

module.exports = function (config) {
  var overrides =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var headers = {};
  var token = overrides.token || config.token;

  if (token) {
    headers.Authorization = "Bearer ".concat(token);
  }

  if (
    !overrides.useGlobalApi &&
    !config.useProjectHostname &&
    config.projectId
  ) {
    headers[projectHeader] = config.projectId;
  }

  var withCredentials = Boolean(
    typeof overrides.withCredentials === "undefined"
      ? config.token || config.withCredentials
      : overrides.withCredentials
  );
  var timeout =
    typeof overrides.timeout === "undefined"
      ? config.timeout
      : overrides.timeout;
  return assign({}, overrides, {
    headers: assign({}, headers, overrides.headers || {}),
    timeout: typeof timeout === "undefined" ? 5 * 60 * 1000 : timeout,
    json: true,
    withCredentials: withCredentials,
  });
};