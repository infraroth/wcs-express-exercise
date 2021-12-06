
const authRouter = require('express').Router();
const User = require('../models/user');

authRouter.post('/checkCredentials', (req, res) => {
  const { email, password } = req.body;
  User.findOneByEmail(email).then((user) => {
    if (!user) res.status(401).send('User not found!');
    else {
      User.verifyPassword(password, user.hashedPassword).then(
        (passwordIsCorrect) => {
          if (passwordIsCorrect) res.send('Your credentials are ok!');
          else res.status(401).send('Wrong credentials!');
        }
      );
    }
  });
});

module.exports = authRouter;