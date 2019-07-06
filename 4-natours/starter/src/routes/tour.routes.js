const express = require('express');

const {
  checkId,
  checkIntegrity,
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour
} = require('../controllers/tour.controller');

const router = express.Router();

router.param('id', checkId);

router
  .route('/')
  .get(getAllTours)
  .post(checkIntegrity, createTour);

router
  .route('/:id')
  .get(getTour)
  .put(updateTour)
  .delete(deleteTour);

module.exports = router;
