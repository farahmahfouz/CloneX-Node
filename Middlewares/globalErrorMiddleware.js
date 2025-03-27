const logger = require('../Utils/logger');

// Middleware for handling errors globally
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'CastError') {
    err.message = `Invalid ${err.path}: ${err.value}.`;
    err.statusCode = 400;
  }
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    err.message = `Duplicate field value: ${value}. Please use another value!`;
    err.statusCode = 400;
    err.name = 'DuplicateDBFields';
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    err.message = `Invalid input data. ${errors.join('. ')}`;
    err.statusCode = 400;
  }
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token, please log in again';
    err.statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    err.message = 'Your token has expired, please log in again';
    err.statusCode = 401;
  }
  logger.error(err.stack);
  res.status(err.statusCode).send({
    status: err.status,
    error: {
      name: err.name,
      statusCode: err.statusCode,
      message: err.message,
    },
  });
};
