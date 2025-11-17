const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database connection error';
  }

  // Return JSON for API errors (Phase 1 is API-only)
  // In Phase 2, you can add HTML view rendering support
  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
