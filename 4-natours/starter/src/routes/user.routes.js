const express = require('express');

const {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser
} = require('../controllers/user.controller');
const { signin, signup } = require('../controllers/auth.controller');

// Routes
const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);

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
