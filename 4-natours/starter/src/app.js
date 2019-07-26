const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

const AppError = require('./services/appError');
const { handleError } = require('./controllers/error.controller');

// Middlewares.
// Set security headers.
app.use(helmet());
// Set development debug.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Set rate limit to avoid DoS.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.'
});
app.use('/api', limiter);
// Set body parser.
app.use(express.json({ limit: '10kb' }));
// Data sanatization against NoSQL injection.
app.use(mongoSanitize());
// Data sanatization agains XSS atacks.
app.use(xss());
// Prevent http param pollution.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
// Set static files folder.
app.use(express.static(path.resolve(__dirname, '..', 'public')));

// Routes.
const API_VERSION = '/api/v1';
const toursRouter = require('./routes/tour.routes');
const usersRouter = require('./routes/user.routes');
//Routes middleware.
app.use(`${API_VERSION}/tours`, toursRouter);
app.use(`${API_VERSION}/users`, usersRouter);
// Default route.
app.all('*', (req, res, next) => {
  // Forward the error.
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// Error Handling middleware.
app.use(handleError);

module.exports = app;
