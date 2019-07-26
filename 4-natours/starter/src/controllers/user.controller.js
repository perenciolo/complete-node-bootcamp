const User = require('../models/user.model');
const catchAsync = require('../services/catchAsync');
const AppError = require('../services/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

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

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if user post password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please user /update-password',
        400
      )
    );
  // 2) Fiter out unwanted field names that are not allowed to be updated.
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 3) Update user document
  const { id } = req.user;
  const updatedUser = await User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.json({
    status: 'success',
    data: { user: updatedUser }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success' });
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
