const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Set ENV variables before exec app.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('./app');

// Configure Database connection URL.
const DB = process.env.DB_CONNECTION_URL.replace(
  /{%DB_USERNAME%}/g,
  process.env.DB_USERNAME
)
  .replace(/{%DB_PASSWORD%}/g, process.env.DB_PASSWORD)
  .replace(/{%DB_HOST%}/g, process.env.DB_HOST)
  .replace(/{%DB_COLECTION%}/g, process.env.DB_COLECTION);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .catch(err => console.error(err));

// Server.
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listen on port: ', port));
