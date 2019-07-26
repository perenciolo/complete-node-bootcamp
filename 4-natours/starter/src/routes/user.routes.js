const express = require('express');

const {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateMe
} = require('../controllers/user.controller');
const {
  authProtect,
  forgotPassword,
  resetPassword,
  signin,
  signup,
  updatePassword
} = require('../controllers/auth.controller');

// Routes
const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:id', resetPassword);

router.patch('/update-password/:token', authProtect, updatePassword);

router.patch('/updateme', authProtect, updateMe);
router.delete('/deleteme', authProtect, deleteMe);

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
