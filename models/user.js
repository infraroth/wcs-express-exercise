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

const findOne = async (id) => {
  const [results] = await db.query('SELECT firstname, lastname, email, city, language FROM users WHERE id = ?', [id]);
  return results[0];
};

const findOneByEmail = (email) => {
  return db.query('SELECT * FROM users WHERE email = ?', [email])
  .then(([results]) => results[0]);
};

const createOne = ({ firstname, lastname, city, language, email, password }) => {
  return hashPassword(password).then((hashedPassword) => {
    return db.query('INSERT INTO users SET ?', {firstname, lastname, city, language, email, hashedPassword })
      .then(([result]) => {
        const id = result.insertId;
        return { id, firstname, lastname, city, language, email };
      });
  });
};

const updateOne = (id, {userUpdates, password}) => {
  return hashPassword(password).then((hashedPassword) => {
    return db.query('UPDATE users SET ? WHERE id = ?', [{...userUpdates, hashedPassword}, id]);
  });
};

const deleteUser = (id) => {
  return db.query('DELETE FROM users WHERE id = ?', [id])
};

module.exports = {
  hashPassword,
  verifyPassword,
  findMany,
  findOne,
  findOneByEmail,
  createOne,
  updateOne,
  deleteUser
};
