const express = require('express');

const {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser
} = require('../controllers/user.controller');

// Routes
const router = express.Router();

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
