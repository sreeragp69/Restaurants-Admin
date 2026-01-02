const mongoSanitize = require("express-mongo-sanitize");

const { sanitize } = mongoSanitize;

function mutateInPlace(target, options) {
  if (!target) return target;
  const result = sanitize(target, options || {});
  return result;
}

function sanitizeMiddleware(options = {}) {
  return function (req, res, next) {
    if (req.body) mutateInPlace(req.body, options);
    if (req.params) mutateInPlace(req.params, options);
    if (req.headers) mutateInPlace(req.headers, options);
    if (req.query) mutateInPlace(req.query, options);
    next();
  };
}

module.exports = sanitizeMiddleware;
