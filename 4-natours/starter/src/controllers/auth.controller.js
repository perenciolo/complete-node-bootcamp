const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../models/user.model');

const catchAsync = require('../services/catchAsync');
const AppError = require('../services/appError');
const sendEmail = require('../services/email');

const signToken = id => {
  return jwt.sign(
    {
      id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

/**
 *
 * @param {object} user
 * @param {object} res
 * @param {number} statusCode
 * @param {string} status
 */
const createAndSendToken = (
  user,
  res,
  statusCode = 200,
  status = 'success'
) => {
  const token = signToken(user._id);
  const cookieOpt = {
    expires: new Date(Date.now + process.env.JWT_EXPIRES_IN),
    httpOnly: true
  };

  // Require https in production.
  if (process.env.NODE_ENV === 'production') cookieOpt.secure = true;

  res.cookie('jwt', token, cookieOpt);

  // remove fields from output.
  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status,
    token,
    data: { user }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createAndSendToken(newUser, res, 201);
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password)
    return next(new AppError('Please provide email and password.', 400));
  // 2) Check if the user exists and password is correct
  const user = await User.findOne({
    email
  }).select('+password');
  if (!user || !(await user.correctPwd(password, user.password)))
    return next(new AppError('Incorrect email or password.', 401));
  // 3) If ok send token
  createAndSendToken(user, res);
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
  const currentUser = await User.findOne({
    _id: decoded.id
  });
  if (!currentUser)
    return next(new AppError('User does no longer exits.', 401));

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPwdAfter(decoded.iat))
    return next(new AppError('Please signin again.', 401));

  // Grant access to protected route.
  req.user = currentUser;
  next();
});

/**
 * Returns a middleware of restricted roles to access something.
 * Needs to be called after authProtect becaude it depends on req.user
 *
 * @param array
 *  roles make all params into an array.
 */
exports.restrictTo = (...roles) => (req, res, next) => {
  // roles ['admin', 'lead-guide']
  if (!roles.includes(req.user.role))
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );

  next();
};

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POST email
  const { email } = req.body;
  const user = await User.findOne({
    email
  });

  if (!user)
    return next(new AppError('There is no user with email address.', 404));
  // 2) Generate the random reset token.
  const resetToken = user.createPwdResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you din't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token. Valid for 10min',
      message
    });

    return res.json({ status: 'Success', message: 'Token sent to email' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error try again.', 500));
  }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // 2) If token has not expired, and there is user, set the new password.
  if (!user) return next(new AppError('Token is invalid.', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user
  // 4) Log user in, send JWT
  createAndSendToken(user, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, passwordCurrent } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password.', 400));

  // 1) Check if the user exists and password is correct
  const user = await User.findOne({
    email
  }).select('+password');
  // 2) Check if POSTed current password is correct
  if (!user || !(await user.correctPwd(passwordCurrent, user.password)))
    return next(new AppError('Incorrect email or password.', 401));
  // 3) If so, update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // 4) Log user in, send JWT
  createAndSendToken(user, res);
});
