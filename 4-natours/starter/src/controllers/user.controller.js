const User = require('../models/user.model');
const catchAsync = require('../services/catchAsync');
const AppError = require('../services/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.updateMe = (req, res, next) => {
  // 1) Create an error if user post password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please user /update-password',
        400
      )
    );
  // 2) Update user document
  res.json({
    status: 'success'
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Undefined route'
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Undefined route'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Undefined route'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Undefined route'
  });
};
