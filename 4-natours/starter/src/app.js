const express = require('express');

const app = express();
const morgan = require('morgan');
const path = require('path');

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

app.use(`${API_VERSION}/tours`, toursRouter);
app.use(`${API_VERSION}/users`, usersRouter);

module.exports = app;
