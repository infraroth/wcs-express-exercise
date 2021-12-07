const connection = require('../db-config');
const argon2 = require('argon2');

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1
};

const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = (plainPassword, hashedPassword) => {
  return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};

const db = connection.promise();

const findMany = ({ filters: { language } }) => {
  let sql = 'SELECT firstname, lastname, email, city, language FROM users';
  const sqlValues = [];
  if (language) {
    sql += ' WHERE language = ?';
    sqlValues.push(language);
  }
  return db.query(sql, sqlValues).then(([results]) => results);
};

const findUserMovies = (user_id) => {
  return db.query('SELECT * FROM movies WHERE user_id = ?', [user_id])
  .then(([results]) => results);
};

const findOne = (id) => {
  return db.query('SELECT firstname, lastname, email, city, language FROM users WHERE id = ?', [id])
  .then(([results]) => results[0]);
};

const findOneByEmail = (email) => {
  return db.query('SELECT * FROM users WHERE email = ?', [email])
  .then(([results]) => results[0]);
};

const findOneByToken = (token) => {
  return db.query('SELECT * FROM users WHERE token = ?', [token])
  .then(([results]) => results[0]);
};

const createOne = ({ firstname, lastname, city, language, email, password, token }) => {
  return hashPassword(password).then((hashedPassword) => {
    return db.query('INSERT INTO users SET ?', {firstname, lastname, city, language, email, hashedPassword, token })
      .then(([result]) => {
        const id = result.insertId;
        return { id, firstname, lastname, city, language, email };
      });
  });
};

const updateOne = (id, userUpdates) => {
  return db.query('UPDATE users SET ? WHERE id = ?', [userUpdates, id]);
};

const deleteUser = (id) => {
  return db.query('DELETE FROM users WHERE id = ?', [id])
};

module.exports = {
  hashPassword,
  verifyPassword,
  findMany,
  findUserMovies,
  findOne,
  findOneByEmail,
  findOneByToken,
  createOne,
  updateOne,
  deleteUser
};
