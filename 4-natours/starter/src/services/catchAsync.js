/**
 * @file app\services\catchAsync
 *
 * Catch async errors.
 * @param {function} fn
 *
 * @returns {function} a function to be called by express.
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};
