const Tour = require('../models/tour.model');
const ApiFeatures = require('../services/apiFeatures');
const catchAsync = require('../services/catchAsync');
const AppError = require('../services/appError');

exports.aliasTopTours = (req, res, next) => {
  // Create Custom field that returns top 5 cheaper destiny.
  req.query.limit = '5';
  // High rating low cost.
  req.query.sort = '-ratingAverage,price';
  // Return fields.
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';

  //forward the request.
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // Build the query.
  const features = new ApiFeatures(Tour.find(), req.query)
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

exports.getTour = catchAsync(async (req, res, next) => {
  const data = await Tour.findOne({ _id: req.params.id });

  if (!data) {
    return next(new AppError('Document not found', 404));
  }

  res.json({
    status: 'success',
    data
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingAverage: { $gte: 4.5 }
      }
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    /*{
      $match: { _id: { $ne: 'easy' } }
    }*/
  ]);

  res.json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          // Between jan/dec
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        // 1 for each doc.
        numToursStarts: { $sum: 1 },
        // Create array of tours
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      // The fields with a value of 0 are hidden. The fields with a value of 1 are shown.
      $project: {
        _id: 0
      }
    },
    // 1 ASC | -1 DESC
    { $sort: { numToursStarts: -1 } },
    // Limit results to #
    { $limit: 12 }
  ]);

  res.json({
    status: 'success',
    data: { plan }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const data = await Tour.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true
  });

  if (!data) {
    return next(new AppError('Document not found', 404));
  }

  res.json({
    status: 'success',
    data
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const data = await Tour.findOneAndDelete({ _id: req.params.id });

  if (!data) {
    return next(new AppError('Document not found', 404));
  }

  res.send(204);
});
