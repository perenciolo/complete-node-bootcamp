/**
 * @file app\services\appError
 *
 */
module.exports = class extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    /**
     * this.status starts with 4 then is fail
     * else this.status is error.
     */
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture where error happened.
    Error.captureStackTrace(this, this.constructor);
  }
};
