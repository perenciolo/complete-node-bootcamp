const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

const { handleExceptions } = require('./services/globalExceptions');

// Set ENV variables before exec app.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

process.on('uncaughtException', err => handleExceptions(err, null));

const app = require('./app');

// Configure Database connection URL.
const DB = process.env.DB_CONNECTION_URL.replace(
  /{%DB_USERNAME%}/g,
  process.env.DB_USERNAME
)
  .replace(/{%DB_PASSWORD%}/g, process.env.DB_PASSWORD)
  .replace(/{%DB_HOST%}/g, process.env.DB_HOST)
  .replace(/{%DB_COLECTION%}/g, process.env.DB_COLECTION);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});
// Server.
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log('Listen on port: ', port));

process.on('unhandledRejection', err => handleExceptions(err, server));
