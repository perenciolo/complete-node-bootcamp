const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have 40 characters or less.'],
      minlength: [10, 'A tour name must have at least 10 characters.']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult.'
      }
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(discount) {
          // this only poinst to current doc on NEW document creation.
          return discount >= 0 && discount < this.price * 0.1;
        },
        message:
          'Discount price ({VALUE}) must be between 0 and 10% of regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary.']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image.']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    /**
     * When data is shown in {JSON} or {Object}
     * virtual properties are included.
     */
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Virtual properties are generaly simple convertions that
 * don't need to be persisted in mongodb.
 */
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
}); // based on duration in days divided by 7.

/**
 * Document Middleware:
 * runs before {.save()} and {.create()}.
 */
tourSchema.pre('save', function(next) {
  /**
   * Create a slug for each doc.
   * Based on {doc.name}.
   *
   * this = the doc.
   */
  this.slug = slugify(this.name, { lower: true });

  next();
});

/**
 * Query middleware.
 *
 * It executes for all queries started with find.
 */
tourSchema.pre(/^find/, function(next) {
  /**
   * Filter only no secret tours.
   *
   * this = query.
   */
  this.find({ secretTour: { $ne: true } });

  next();
});

/**
 * Aggregation Middleware.
 *
 * It executes for all aggregation queries.
 */
tourSchema.pre('aggregate', function(next) {
  /**
   * Filter only no secret tours by unshifting another
   * $match to the pipeline.
   *
   * this = current aggregation object.
   */
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  next();
});

module.exports = mongoose.model('Tour', tourSchema);
