const mongoose = require('mongoose');

const Tour = require('./tour.model');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must not be empty.']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to an user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.select('-__v -id').populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tour) {
  const stats = await this.aggregate([
    { $match: { tour } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length < 1)
    return await Tour.findByIdAndUpdate(tour, {
      ratingQuantity: 0,
      ratingAverage: 4.5
    });

  await Tour.findByIdAndUpdate(tour, {
    ratingQuantity: stats[0].nRating,
    ratingAverage: stats[0].avgRating
  });
};

reviewSchema.post('save', function() {
  // this points to current review.
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.rev = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  if (!this.review) return;
  
  await this.review.constructor.calcAverageRatings(this.review.tour);
});

module.exports = mongoose.model('Review', reviewSchema);
