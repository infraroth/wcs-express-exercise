const moviesRouter = require('express').Router();
const Movie = require('../models/movie');

moviesRouter.get('/', (req, res) => {
  const { max_duration, color } = req.query;
  Movie.findMany({ filters: { max_duration, color } })
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error retrieving movies from database');
    });
});

moviesRouter.get('/:id', (req, res) => {
  const movieId = Number(req.params.id);
  Movie.findOne(movieId)
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).send('Movie not found');
      }
    })
    .catch((err) => {
      res.status(500).send('Error retrieving movie from database');
    });
});

moviesRouter.post('/', (req, res) => {
  const errors = [];
  const { title, director, year, color, duration } = req.body;
  if (!title)
    errors.push({ field: 'title', message: 'This field is required' });
  else if (title.length >= 255)
    errors.push({ field: 'title', message: 'Should contain less than 255 characters' });
  if (!director)
    errors.push({ field: 'director', message: 'This field is required' });
  else if (director.length >= 255)
    errors.push({ field: 'director', message: 'Should contain less than 255 characters' });
  if (!year)
    errors.push({ field: 'year', message: 'This field is required' });
  else if (year <= 1888 || !Number.isInteger(year))
    errors.push({ field: 'year', message: 'Needs to be from 1889 or after' });
  else if (!Number.isInteger(year))
    errors.push({ field: 'year', message: 'Needs to be a number' });
  if (color == undefined)
    errors.push({ field: 'color', message: 'This field is required' });
  else if (color >= 2 || !Number.isInteger(color))
    errors.push({ field: 'color', message: 'Needs to be 0 or 1' });
  if (!duration)
    errors.push({ field: 'duration', message: 'This field is required' });
  else if (duration <= 0 || !Number.isInteger(duration))
    errors.push({ field: 'duration', message: 'Needs to be a number greater than 0' });
  if (errors.length) {
    res.status(422).json({ validationErrors: errors });
  } else {
    Movie.createOne(req.body)
      .then((createdMovie) => {
        res.status(201).json(createdMovie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error saving the movie');
      });
  }
});

moviesRouter.put('/:id', (req, res) => {
  let existingMovie = null;
  const errors = [];
  Movie.findOne(req.params.id)
    .then((movie) => {
      const { title, director, year, color, duration } = req.body;
      if (title !== undefined && title.length >= 255)
        errors.push({ field: 'title', message: 'Should contain less than 255 characters' });
      if (director !== undefined && director.length >= 255)
        errors.push({ field: 'director', message: 'Should contain less than 255 characters' });
      if (year !== undefined && (year <= 1888 || !Number.isInteger(year)))
        errors.push({ field: 'year', message: 'Needs to be from 1889 or after' });
      else if (!Number.isInteger(year))
        errors.push({ field: 'year', message: 'Needs to be a number' });
      if (color !== undefined && (color >= 2 || !Number.isInteger(color)))
        errors.push({ field: 'color', message: 'Needs to be 0 or 1' });
      else if (duration !== undefined && (duration <= 0 || !Number.isInteger(duration)))
        errors.push({ field: 'duration', message: 'Needs to be a number greater than 0' });
      existingMovie = movie;
      if (!existingMovie) return Promise.reject('RECORD_NOT_FOUND');
      if (errors.length) return Promise.reject('INVALID_DATA');
      return Movie.updateOne(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ ...existingMovie, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === 'RECORD_NOT_FOUND')
        res.status(404).send(`Movie with id ${req.params.id} not found.`);
      else if (err === 'INVALID_DATA')
        res.status(422).json({ validationErrors: errors });
      else res.status(500).send('Error updating a movie.');
    });
});

moviesRouter.delete('/:id', (req, res) => {
  const movieId = Number(req.params.id);
  Movie.deleteOne(movieId)
    .then((result) => {
      res.status(201).send('Movie deleted successfully 🎉');
    })
    .catch((err) => {
      res.status(500).send('Error while deleting movie');
    });
});

module.exports = moviesRouter;
