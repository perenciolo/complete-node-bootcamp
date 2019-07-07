const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/user.model');
const catchAsync = require('../services/catchAsync');
const AppError = require('../services/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password)
    return next(new AppError('Please provide email and password.', 400));
  // 2) Check if the user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPwd(password, user.password)))
    return next(new AppError('Incorrect email or password.', 401));
  // 3) If ok send token
  const token = signToken(user._id);

  res.json({
    status: 'success',
    token
  });
});

exports.authProtect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  )
    return next(
      new AppError('Protected route, please sign in to get access.', 401)
    );

  const token = req.headers.authorization.split(' ')[1];

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findOne({ _id: decoded.id });
  if (!currentUser)
    return next(new AppError('User does no longer exits.', 401));

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPwdAfter(decoded.iat))
    return next(new AppError('Please signin again.', 401));

  // Grant access to protected route.
  req.user = currentUser;
  next();
});
