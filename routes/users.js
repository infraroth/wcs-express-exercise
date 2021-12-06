const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', (req, res) => {
  const { language } = req.query;
  User.findMany({ filters: { language } })
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving users from database');
    });
});

usersRouter.get('/:id', (req, res) => {
  User.findOne(req.params.id)
    .then((user) => {
      if (user) res.json(user);
      else res.status(404).send('User not found');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving user from database');
    });
});

usersRouter.post('/', (req, res) => {
  const errors = [];
  const { firstname, lastname, email, city, language, password } = req.body;
  const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;
  if (!emailRegex.test(email))
    errors.push({ field: 'email', message: 'Invalid email' });
  if (!firstname)
    errors.push({ field: 'firstname', message: 'This field is required' });
  else if (firstname.length >= 255)
    errors.push({ field: 'firstname', message: 'Should contain less than 255 characters' });
  if (!lastname)
    errors.push({ field: 'lastname', message: 'This field is required' });
  if (!email)
    errors.push({ field: 'email', message: 'This field is required' });
  if (!password)
    errors.push({ field: 'plainPassword', message: 'This field is required' });
  else if (password.length < 8)
    errors.push({ field: 'plainPassword', message: 'Should contain more than 8 characters' });
  if (city.length >= 255)
    errors.push({ field: 'city', message: 'Should contain less than 255 characters' });
  if (language.length >= 255)
    errors.push({ field: 'language', message: 'Should contain less than 255 characters' });
  if (errors.length) {
    res.status(422).json({ validationErrors: errors });
  } else {
    User.createOne(req.body)
      .then((createdUser) => {
        res.status(201).json(createdUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error saving user');
      });
  }
});

usersRouter.put('/:id', (req, res) => {
  let existingUser = null;
  const errors = [];
  User.findOne(req.params.id)
    .then((user) => {
      const { firstname, city, language } = req.body;
      existingUser = user;
      if (firstname !== undefined && firstname.length >= 255)
        errors.push({ field: 'firstname', message: 'Should contain less than 255 characters' });
      if (city !== undefined && city.length >= 255)
        errors.push({ field: 'city', message: 'Should contain less than 255 characters' });
      if (language !== undefined && language.length >= 255)
        errors.push({ field: 'language', message: 'Should contain less than 255 characters' });
      if (errors.length) return Promise.reject('INVALID_DATA');
      return User.updateOne(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === 'RECORD_NOT_FOUND')
        res.status(404).send(`User with id ${req.params.id} not found.`);
      else if (err === 'INVALID_DATA')
        res.status(422).json({ validationErrors: errors });
      else res.status(500).send('Error updating user.');
    });
});

usersRouter.delete('/:id', (req, res) => {
  User.deleteUser(req.params.id)
    .then((deleted) => {
      if (deleted) res.status(200).send('🎉 User deleted!');
      else res.status(404).send('User not found');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error deleting a user');
    });
});

module.exports = usersRouter;
