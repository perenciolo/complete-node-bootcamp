const express = require('express');

const {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getDistances,
  geoMetadataValidation,
  getMonthlyPlan,
  getTour,
  getTourStats,
  getToursWithin,
  updateTour
} = require('../controllers/tour.controller');
const { authProtect, restrictTo } = require('../controllers/auth.controller');
const reviewRouter = require('../routes/review.routes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(authProtect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng')
  .get(geoMetadataValidation, getToursWithin);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(geoMetadataValidation, getToursWithin);

router.route('/distances/:latlng').get(geoMetadataValidation, getDistances);
router
  .route('/distances/:latlng/unit/:unit')
  .get(geoMetadataValidation, getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(authProtect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(authProtect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(authProtect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
