const User = require('../models/user.model');
const catchAsync = require('../services/catchAsync');

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
