const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

const AppError = require('./services/appError');
const { handleError } = require('./controllers/error.controller');

// Middlewares.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
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
