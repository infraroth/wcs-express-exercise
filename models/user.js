const connection = require('../db-config');

const db = connection.promise();

const findMany = ({ filters: { language } }) => {
  let sql = 'SELECT * FROM users';
  const sqlValues = [];
  if (language) {
    sql += ' WHERE language = ?';
    sqlValues.push(language);
  }

  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOne = (id) => {
  return db.query('SELECT * FROM users WHERE id = ?', [id])
  .then(([results]) => results[0]);
};

const createOne = (user) => {
  return db.query('INSERT INTO users SET ?', user).then(([result]) => {
    const id = result.insertId;
    return { ...user, id };
  });
};

const updateOne = (id, userInfo) => {
  return db.query('UPDATE users SET ? WHERE id = ?', [userInfo, id]);
};

const deleteUser = (id) => {
  return db.query('DELETE FROM users WHERE id = ?', [id])
};

module.exports = {
  findMany,
  findOne,
  createOne,
  updateOne,
  deleteUser
};
