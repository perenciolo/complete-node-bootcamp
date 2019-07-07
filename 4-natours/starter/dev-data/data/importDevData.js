const dotenv = require('dotenv');
const path = require('path');
// Set ENV variables before exec app.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
const fs = require('fs');
const mongoose = require('mongoose');

const Tour = require('../../src/models/tour.model');

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

// Read JSON File.
const tours = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'tours-simple.json'), 'utf-8')
);

/**
 * Console Colors reference
    const colors = {
 Reset: "\x1b[0m",
 Bright: "\x1b[1m",
 Dim: "\x1b[2m",
 Underscore: "\x1b[4m",
 Blink: "\x1b[5m",
 Reverse: "\x1b[7m",
 Hidden: "\x1b[8m",
 fg: {
  Black: "\x1b[30m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  White: "\x1b[37m",
  Crimson: "\x1b[38m"
 },
 bg: {
  Black: "\x1b[40m",
  Red: "\x1b[41m",
  Green: "\x1b[42m",
  Yellow: "\x1b[43m",
  Blue: "\x1b[44m",
  Magenta: "\x1b[45m",
  Cyan: "\x1b[46m",
  White: "\x1b[47m",
  Crimson: "\x1b[48m"
 }
};
 */

// Import Data Into DB.
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('\x1b[5m\x1b[32m', 'Data', 'successfully', 'loaded!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

// Delete all data from Collection.
const deleteData = async () => {
  try {
    // DeleteMany without conditions delete all data from collection.
    await Tour.deleteMany();
    console.log('\x1b[5m\x1b[31m', 'Data', 'successfully', 'deleted!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

// E.g.: node dev-data/data/importDevData.js --import
// E.g.2: node dev-data/data/importDevData.js --delete
if (process.argv[2] === '--import' || process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '--delete' || process.argv[2] === '-d') {
  deleteData();
}
