const catchAsync = require('../services/catchAsync');
const {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} = require('./handler.factory');

const Review = require('../models/review.model');

/**
 * @param {Review}
 */
exports.setFilterByParams = (req, res, next) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  req.body.filter = filter;

  next();
};

exports.getAllReviews = getAll(Review);

exports.setBodyByParams = (req, res, next) => {
  // Allow nested routes.
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

/**
 * @param {Review}
 */
exports.getReview = getOne(Review);

/**
 * @param {Review}
 */
exports.createReview = createOne(Review);

/**
 * @param {Review}
 */
exports.updateReview = updateOne(Review);

/**
 * @param {Review}
 */
exports.deleteReview = deleteOne(Review);
