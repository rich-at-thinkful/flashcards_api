module.exports = function notFound(req, res, next) {
  next({
    status: 404,
    message: `Route not found: ${req.originalUrl}`
  });
};
