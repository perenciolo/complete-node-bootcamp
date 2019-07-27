const User = require('../models/user.model');
const catchAsync = require('../services/catchAsync');
const AppError = require('../services/appError');
const { deleteOne, getAll, getOne, updateOne } = require('./handler.factory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

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

/**
 * @param {User}
 */
exports.getAllUsers = getAll(User);

/**
 * @param {User}
 */
exports.getUser = getOne(User);

/**
 * Do not update passwords with this route.
 *
 * @param {User}
 */
exports.updateUser = updateOne(User);

/**
 * @param {User}
 */
exports.deleteUser = deleteOne(User);
