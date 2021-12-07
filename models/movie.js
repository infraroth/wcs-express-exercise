const connection = require('../db-config');

const db = connection.promise();

const findMany = ({ filters: { color, max_duration } }) => {
  let sql = 'SELECT * FROM movies';
  const sqlValues = [];

  if (color) {
    sql += ' WHERE color = ?';
    sqlValues.push(color);
  }
  if (max_duration) {
    if (color) sql += ' AND duration <= ? ;';
    else sql += ' WHERE duration <= ?';

    sqlValues.push(max_duration);
  }

  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOne = (id) => {
  return db.query('SELECT * FROM movies WHERE id = ?', [id])
  .then(([results]) => results[0]);
};

const createOne = ({ title, director, year, color, duration, user_id }) => {
  return db.query(
      'INSERT INTO movies (title, director, year, color, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, director, year, color, duration, user_id]
    ).then(([result]) => {
      const id = result.insertId;
      return { id, title, director, year, color, duration, user_id };
    });
};

const updateOne = (movieId, movieUpdates) => {
  return db.query('UPDATE movies SET ? WHERE id = ?', [movieUpdates, movieId]);
};

const deleteOne = (id) => {
  return db.query('DELETE FROM movies WHERE id = ?', [id]);
};

module.exports = {
  findMany,
  findOne,
  createOne,
  updateOne,
  deleteOne
};
