const express = require('express');

const {
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
  updateMe
} = require('../controllers/user.controller');
const {
  authProtect,
  forgotPassword,
  resetPassword,
  restrictTo,
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

// Protect all routes below this point.
router.use(authProtect);

router.patch('/update-password/:token', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateme', updateMe);
router.delete('/deleteme', deleteMe);

// Restrict to administrators all routes below this point.
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
