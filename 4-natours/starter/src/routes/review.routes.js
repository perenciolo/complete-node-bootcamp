const express = require('express');

const { authProtect, restrictTo } = require('../controllers/auth.controller');
const {
  createReview,
  deleteReview,
  getReview,
  getAllReviews,
  setBodyByParams,
  setFilterByParams,
  updateReview
} = require('../controllers/review.controller');

const router = express.Router({ mergeParams: true });

// Protect all routes below this point.
router.use(authProtect);

router
  .route('/')
  .get(setFilterByParams, getAllReviews)
  .post(restrictTo('user'), setBodyByParams, createReview);

router
  .route('/:id')
  .get(setFilterByParams, getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
