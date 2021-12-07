const usersRouter = require('express').Router();
const User = require('../models/user');
const { calculateToken } = require('../helpers/users');

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
  const newUser = {};
  const { firstname, lastname, email, city, language, password } = req.body;
  const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;
  if (!emailRegex.test(email))
    errors.push({ field: 'email', message: 'Invalid email' });
  if (!firstname)
    errors.push({ field: 'firstname', message: 'This field is required' });
  else if (firstname.length >= 255)
    errors.push({ field: 'firstname', message: 'Should contain less than 255 characters' });
  else newUser.firstname = firstname;
  if (!lastname)
    errors.push({ field: 'lastname', message: 'This field is required' });
  else newUser.lastname = lastname;
  if (!email)
    errors.push({ field: 'email', message: 'This field is required' });
  else {
    newUser.email = email;
    const token = calculateToken(email);
    newUser.token = token;
  }
  if (!password)
    errors.push({ field: 'password', message: 'This field is required' });
  else if (password.length < 8)
    errors.push({ field: 'password', message: 'Should contain more than 8 characters' });
  else newUser.password = password;
  if (city.length >= 255)
    errors.push({ field: 'city', message: 'Should contain less than 255 characters' });
  if (city) newUser.city = city;
  if (language.length >= 255)
    errors.push({ field: 'language', message: 'Should contain less than 255 characters' });
  if (language) newUser.language = language;
  if (errors.length) {
    res.status(422).json({ validationErrors: errors });
  } else {
    res.cookie('user_token', newUser.token)
    User.createOne(newUser)
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
  const userUpdates = {};
  User.findOne(req.params.id)
    .then((user) => {
      const { firstname, lastname, email, city, language, password } = req.body;
      existingUser = user;
      if (firstname !== undefined && firstname.length >= 255)
        errors.push({ field: 'firstname', message: 'Should contain less than 255 characters' });
      if (firstname) userUpdates.firstname = firstname;
      if (lastname !== undefined && lastname.length >= 255)
        errors.push({ field: 'lastname', message: 'Should contain less than 255 characters' });
      if (lastname) userUpdates.lastname = lastname;
      const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;
      if (email !== undefined && !emailRegex.test(email))
        errors.push({ field: 'email', message: 'Invalid email' });
      if (email) {
        userUpdates.email = email;
        const token = calculateToken(email);
        userUpdates.token = token;
        res.cookie('user_token', token);
      };
      if (city !== undefined && city.length >= 255)
        errors.push({ field: 'city', message: 'Should contain less than 255 characters' });
      if (city) userUpdates.city = city;
      if (language !== undefined && language.length >= 255)
        errors.push({ field: 'language', message: 'Should contain less than 255 characters' });
      if (language) userUpdates.language = language;
      if (password !== undefined && password.length < 8)
        errors.push({ field: 'password', message: 'Should contain more than 8 characters' });
      if (password) {
        return User.hashPassword(password).then((hashedPassword) => {
          userUpdates.hashedPassword = hashedPassword;
        });
      }
      if (errors.length) return Promise.reject('INVALID_DATA');
    })
    .then(() => {
      User.updateOne(req.params.id, userUpdates);
    })
    .then(() => {
      res.status(200).json('User successfully updated.')
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
