const Tour = require('../models/tour.model');
const ApiFeatures = require('../services/apiFeatures');

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

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const data = await Tour.findOne({ _id: req.params.id });

    if (!data) {
      throw new Error('Not Found');
    }

    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const data = await Tour.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true
    });

    if (!data) {
      throw new Error('Not Found');
    }

    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const data = await Tour.findOneAndDelete({ _id: req.params.id });

    if (!data) {
      throw new Error('Not Found');
    }

    res.send(204);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};
