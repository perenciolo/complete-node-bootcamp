const express = require('express');

const {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour
} = require('../controllers/tour.controller');
const { authProtect, restrictTo } = require('../controllers/auth.controller');

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/')
  .get(authProtect, getAllTours)
  .post(createTour);

router
  .route('/:id')
  .get(getTour)
  .put(updateTour)
  .delete(authProtect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
