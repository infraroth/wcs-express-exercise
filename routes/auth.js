const authRouter = require('express').Router();
const User = require('../models/user');
const { calculateToken } = require('../helpers/users');

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOneByEmail(email).then((user) => {
    if (!user) res.status(401).send('User not found!');
    else {
      User.verifyPassword(password, user.hashedPassword).then(
        (passwordIsCorrect) => {
          if (passwordIsCorrect) {
            const token = calculateToken(email);
            User.updateOne(user.id, { token: token })
            res.cookie('user_token', token)
            res.status(200).json('User credentials ok!')
          }
        }
      );
    }
  });
});

module.exports = authRouter;