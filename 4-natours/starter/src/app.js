const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const API_VERSION = '/api/v1';
const toursDB = path.resolve(
  __dirname,
  '..',
  'dev-data/data/tours-simple.json'
);

// Middlewares.
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(toursDB));

app.get(`${API_VERSION}/tours`, (req, res) => {
  res.json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

app.get(`${API_VERSION}/tours/:id`, (req, res) => {
  const single = tours.filter(el => +el.id === +req.params.id);

  if (!single.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Not found.',
      results: []
    });
  }

  res.json({
    status: 'success',
    tour: single[0]
  });
});

app.post(`${API_VERSION}/tours`, (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(toursDB, JSON.stringify(tours), err => {
    if (err) throw err;
    res.json({ status: 'success', data: { tour: newTour } });
  });
});

app.put(`${API_VERSION}/tours/:id`, (req, res) => {
  const single = tours.filter(el => +el.id === +req.params.id);

  if (!single.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Not found.',
      results: []
    });
  }

  // Assing the old id to the new tour.
  const newTour = Object.assign({ id: +req.params.id }, req.body);

  // Update memory tours with the new tour in the place of the previous one.
  tours.splice(tours.indexOf(single[0]), 1, newTour);

  // Update 'DB' with the new tour.
  fs.writeFile(toursDB, JSON.stringify(tours), error => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ status: 'success', data: { tour: newTour } });
  });
});
app.delete(`${API_VERSION}/tours/:id`, (req, res) => {
  const single = tours.filter(el => +el.id === +req.params.id);

  if (!single.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Not found.',
      results: []
    });
  }

  // Update memory tours array by deleting the tour.
  tours.splice(tours.indexOf(single[0]), 1);

  // Update 'DB' with the new tour.
  fs.writeFile(toursDB, JSON.stringify(tours), error => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ status: 'success' });
  });
});
const port = 3001;
app.listen(port, () => console.log('Listen on port: ', port));
