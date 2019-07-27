const Tour = require('../models/tour.model');
const catchAsync = require('../services/catchAsync');
const AppError = require('../services/appError');
const {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} = require('./handler.factory');

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

/**
 * @param {Tour}
 */
exports.getAllTours = getAll(Tour);

/**
 * @param {Tour}
 * @param {object}
 */
exports.getTour = getOne(Tour, { path: 'reviews' });

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

exports.geoMetadataValidation = (req, res, next) => {
  const { latlng, unit = 'km' } = req.params;

  if (!latlng) return next(new AppError('Lat,Long is required', 400));

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide the latitude and longitude in the format: lat,lng.',
        400
      )
    );

  if (unit !== 'km' && unit !== 'mi')
    return next(
      new AppError(
        'Please provide the distance in kilometers or Milesin the format: km or mi.',
        400
      )
    );

  // Set desired params.
  req.params.lat = lat;
  req.params.lng = lng;
  req.params.unit = unit;

  next();
};

/**
 * Needs to come after geoMetadataValidation middleware.
 */
exports.getToursWithin = catchAsync(async (req, res, next) => {
  // /tours-within/:distance/center/:latlng/unit/:unit
  const { distance, lat, lng, unit } = req.params;

  if (!distance) return next(new AppError('Distance is required', 400));

  // define earth radius given the unit.
  const earthRad = unit === 'mi' ? 3963.2 : 6378.1;
  // define radius in radians.
  const radius = distance / earthRad;

  const data = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.json({
    status: 'success',
    results: data.length,
    data: { data }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { distance, lat, lng, unit } = req.params;

  // Calculate multiplier given unit.
  const multiplier = unit === 'km' ? 0.001 : 0.000621371;

  const data = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [+lng, +lat] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.json({
    status: 'success',
    data: { data }
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

/**
 * @param {Tour}
 */
exports.createTour = createOne(Tour);

/**
 * @param {Tour}
 */
exports.updateTour = updateOne(Tour);

/**
 * @param {Tour}
 */
exports.deleteTour = deleteOne(Tour);
