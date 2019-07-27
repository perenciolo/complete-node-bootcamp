const catchAsync = require('../services/catchAsync');
const AppError = require('../services/appError');
const ApiFeatures = require('../services/apiFeatures');

/**
 * @param {Object<mongoose.model>}
 */
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const data = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data
      }
    });
  });

/**
 * @param {Object<mongoose.model>}
 */
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findOneAndDelete({ _id: req.params.id });

    if (!data) return next(new AppError('Document not found', 404));

    res.send(204);
  });

/**
 * @param {Object<mongoose.model>} Model
 */
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.body.filter) filter = req.body.filter;

    // Build the query.
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query.
    const data = await features.query;

    // Send response.
    res.json({
      status: 'success',
      results: data.length,
      data
    });
  });

/**
 * @param {Object<mongoose.model>} Model
 * @param {Object} populateOpt
 */
exports.getOne = (Model, populateOpt = null) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne({ _id: req.params.id });

    if (populateOpt) query = query.populate(populateOpt);

    const data = await query;

    if (!data) {
      return next(new AppError('Document not found', 404));
    }

    res.json({
      status: 'success',
      data
    });
  });

/**
 * @param {Object<mongoose.model>}
 */
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const { password, passwordConfirm } = req.body;

    if (password || passwordConfirm)
      return next(
        new AppError('Password changes not allowed in this route.', 400)
      );

    const data = await Model.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true
      }
    );

    if (!data) {
      return next(new AppError('Document not found', 404));
    }

    res.json({
      status: 'success',
      data
    });
  });
