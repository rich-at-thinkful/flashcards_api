const logger = require("../logger");

module.exports = function errorHandler(error, req, res, _next) {
  console.error(error);
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  logger.error(message);
  
  res
    .status(status)
    .json({ error: message });
};
