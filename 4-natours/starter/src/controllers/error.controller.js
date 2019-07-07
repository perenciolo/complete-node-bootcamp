const AppError = require('../services/appError');

/**
 * Returns AppError for invalid ids.
 * @param {Object} err
 *
 * @returns {AppError} instace of AppError.
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Returns AppError for duplicated fields.
 *
 * @param {Object} err
 *
 * @returns {AppError} instace of AppError.
 */
const handleFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicated field value: ${value}. Please use another`;
  return new AppError(message, 400);
};
/**
 * Returns AppError for invalid input data.
 *
 * @param {Object} err
 *
 * @returns {AppError} instace of AppError.
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = { text: 'Invalid input data:', errors };

  return new AppError(JSON.stringify(message), 400);
};

/**
 * Send error as response
 *
 * @param {Object} err
 * @param {Object} res
 */
const sendError = (err, res) => {
  res.status(err.statusCode).json(err);
};

/**
 * Helper function handlerError
 *
 * @param {object} err
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
exports.handleError = (err, req, res, next) => {
  // Set {Object} error.
  const error = {
    status: err.status || 'error',
    statusCode: err.statusCode || 500,
    message: err.message
  };

  // More information in development.
  if (process.env.NODE_ENV === 'development') {
    error.error = err;
    error.stack = err.stack;
  }

  // Less information in production.
  if (process.env.NODE_ENV === 'production') {
    // Assume CastErrors as bad request errors.
    if (err.name === 'CastError') {
      const { message, statusCode, status, isOperational } = handleCastErrorDB(
        err
      );
      error.status = status;
      error.statusCode = statusCode;
      error.message = message;
      error.isOperational = isOperational;
    }
    // Assume duplicated names as bad request.
    else if (err.code === 11000) {
      const { message, statusCode, status, isOperational } = handleFieldsDB(
        err
      );
      error.status = status;
      error.statusCode = statusCode;
      error.message = message;
      error.isOperational = isOperational;
    }
    // Assume validation errors as bad request.
    if (err.name === 'ValidationError') {
      const {
        message,
        statusCode,
        status,
        isOperational
      } = handleValidationErrorDB(err);
      error.status = status;
      error.statusCode = statusCode;
      error.message = message;
      error.isOperational = isOperational;
    }
    // Programming or other unknown error: don't leak error details.
    else if (!err.isOperational) {
      // 1) Log error
      console.error(err);
      // 2) Send generic message.
      error.statusCode = 500;
      error.message = 'Something went wrong.';
    }
  }

  sendError(error, res);
};
