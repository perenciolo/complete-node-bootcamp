const fs = require('fs');
const path = require('path');

const toursDB = path.resolve(
  __dirname,
  '..',
  '..',
  'dev-data/data/tours-simple.json'
);

const assureConsistency = (data, type) => {
  if (!data) return false;

  switch (type) {
    case 'number':
      return (
        !isNaN(data) && typeof data !== 'boolean' && typeof data !== 'string'
      );
    case 'string':
      return typeof data === 'string';
  }
};

const tours = JSON.parse(fs.readFileSync(toursDB));

const findOnFile = (_set, _id) => {
  if (!_set || !_set.length) return null;

  return _set.filter(el => +el.id === +_id);
};

exports.checkId = (req, res, next, id) => {
  const single = findOnFile(tours, id);

  if (!single || !single.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Not found.',
      results: []
    });
  }

  next();
};

exports.checkIntegrity = (req, res, next) => {
  const { name, price } = req.body;

  const isValidName = assureConsistency(name, 'string');
  const isValidPrice = assureConsistency(price, 'number');

  // Check data consistency.
  if (!isValidName || !isValidPrice) {
    // Set Validation Message.
    let errors = [];

    if (!isValidName) {
      errors = [
        ...errors,
        { name: 'Name field is required and must be a valid string.' }
      ];
    }

    if (!isValidPrice) {
      errors = [
        ...errors,
        { price: 'Price field is required and must be a number.' }
      ];
    }

    return res.status(400).json({
      status: 'fail',
      message: 'Bad request.',
      errors
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  res.json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
};

exports.getTour = (req, res) => {
  const single = findOnFile(tours, req.params.id);

  res.json({
    status: 'success',
    tour: single[0]
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(toursDB, JSON.stringify(tours), err => {
    if (err) throw err;
    res.json({ status: 'success', data: { tour: newTour } });
  });
};

exports.updateTour = (req, res) => {
  // Assing the old id to the new tour.
  const newTour = Object.assign({ id: +req.params.id }, req.body);
  const single = findOnFile(tours, req.params.id);

  // Update memory tours with the new tour in the place of the previous one.
  tours.splice(tours.indexOf(single[0]), 1, newTour);

  // Update 'DB' with the new tour.
  fs.writeFile(toursDB, JSON.stringify(tours), error => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ status: 'success', data: { tour: newTour } });
  });
};

exports.deleteTour = (req, res) => {
  const single = findOnFile(tours, req.params.id);

  // Update memory tours array by deleting the tour.
  tours.splice(tours.indexOf(single[0]), 1);

  // Update 'DB' with the new tour.
  fs.writeFile(toursDB, JSON.stringify(tours), error => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(204).send();
  });
};
