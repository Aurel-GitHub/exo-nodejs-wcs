const connection = require("./db-config");
const express = require("express");
const app = express();
const Joi = require('joi');

const port = process.env.PORT || 3000;

connection.connect((err) => {
  if (err) {
    console.error("error connection: " + err.stack);
  } else {
    console.log("Connected to database with thredId: " + connection.threadId);
  }
});
app.use(express.json());

app.get("/api/series", (req, res) => {
  let sql = "SELECT * FROM series";
  const sqlValues = [];
  if (req.query.year) {
    sql += " WHERE year = ?";
    sqlValues.push(req.query.year);
  } else if (req.query.color) {
    sql += " WHERE color = ?";
    sqlValues.push(req.query.color);
  }
  connection.query(sql, sqlValues, (err, result) => {
    err
      ? res.status(500).json("Error retrieving data from database")
      : res.status(200).json(result);
  });
});

app.get("/api/users", (req, res) => {
  connection.query("SELECT * FROM users", (err, result) => {
    err
      ? res.status(500).json("Error retrieving data from database")
      : res.status(200).json(result);
  });
});

app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving user from database");
      } else {
        if (results.length) res.json(results[0]);
        else res.status(404).send("User not found");
      }
    }
  );
});
app.get("/api/series/:id", (req, res) => {
  const seriesId = req.params.id;
  connection.query(
    "SELECT * FROM series WHERE id = ?",
    [seriesId],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving serie from database");
      } else {
        if (results.length) res.json(results[0]);
        else res.status(404).send("Serie not found");
      }
    }
  );
});

app.post("/api/series", (req, res) => {
  const { title, director, year, color, nbEpisodes, nbSeasons } = req.body;
  const db = connection.promise();
  let validationErrors = null;
  const sql = "INSERT INTO series(title, director, year, color, nbEpisodes, nbSeasons) VALUES (?, ?, ?, ?, ?, ?)";
  const fields = [title, director, year, color, nbEpisodes, nbSeasons];
  db.query(sql, fields)
    .then (() => {
      validationErrors = Joi.object({
        title: Joi.string().max(255).required(),
        director: Joi.string().max(255).required(),
        year: Joi.number().integer().min(1888).required(),
        color: Joi.bool().required(),
        nbEpisodes: Joi.number().integer().min(1).required(),
        nbSeasons: Joi.number().integer().min(1).required(),
      }).validate({ title, director, year, color, nbEpisodes, nbSeasons }, {abortEarly: false}).error;
      if (validationErrors) return Promise.reject('INVALID_DATA');
      return db.query(sql, fields);
    })
    .then(([{insertId}]) => {
      res.status(201).json({id: insertId, title, director, year, color, nbEpisodes, nbSeasons});
    })
    .catch((err) => {
      if (err === 'INVALID_DATA')
        res.status(422).json({validationErrors});
      else res.status(500).send('Error saving the serie');
    });
});

app.post('/api/users', (req, res) => {
  const { firstname, lastname, email} = req.body;
  const db = connection.promise();
  let validationErrors = null;
  db.query('SELECT * FROM users WHERE email = ?', [email])
    .then(([result]) => {
      if (result[0]) return Promise.reject('DUPLICATE_EMAIL');
      validationErrors = Joi.object({
        email: Joi.string().email().max(255).required(),
        firstname: Joi.string().max(255).required(),
        lastname: Joi.string().max(255).required(),
      }).validate({ firstname, lastname, email }, { abortEarly: false }).error;
      if (validationErrors) return Promise.reject('INVALID_DATA');
      return db.query(
        'INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)',
        [firstname, lastname, email,]
      );
    })
    .then(([{ insertId }]) => {
      res.status(201).json({ id: insertId, firstname, lastname, email });
    })
    .catch((err) => {
      console.error(err);
      if (err === 'DUPLICATE_EMAIL')
        res.status(409).json({ message: 'This email is already used' });
      else if (err === 'INVALID_DATA')
        res.status(422).json({ validationErrors });
      else res.status(500).send('Error saving the user');
    });
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { firstname, lastname, email } = req.body;
  const db = connection.promise();
  let existingUser = null;
  let validationErrors = null;
  db.query('SELECT * FROM users WHERE id = ?', [userId])
    .then(([results]) => {
      validationErrors = Joi.object({
        email: Joi.string().email().max(255),
        firstname: Joi.string().max(255),
        lastname: Joi.string().max(255),
      }).validate({ firstname, lastname, email }, { abortEarly: false }).error;
      existingUser = results[0];
      if (!existingUser) return Promise.reject('RECORD_NOT_FOUND');
      if (validationErrors) return Promise.reject('INVALID_DATA');
      return db.query('UPDATE users SET ? WHERE id = ?', [req.body, userId]);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === 'RECORD_NOT_FOUND')
        res.status(404).send(`User with id ${userId} not found.`);
      else res.status(500).send('Error updating a user');
    });
});

app.put("/api/series/:id", (req, res) => {
  const seriesId = req.params.id;
  const db = connection.promise();
  const {title, director, year, color, nbEpisodes, nbSeasons} = req.body;
  let existingSerie = null;
  let validationErrors = null;
  db.query("SELECT * FROM series WHERE id = ?", [seriesId])
  .then(([results]) => {
    validationErrors = Joi.object({
      title: Joi.string().max(255),
      director: Joi.string().max(255),
      year: Joi.number().integer().min(1888),
      color: Joi.bool(),
      nbEpisodes: Joi.number().integer().min(1),
      nbSeasons: Joi.number().integer().min(1),
    }).validate({ title, director, year, color, nbEpisodes, nbSeasons }, { abortEarly: false }).error;
    existingSerie = results[0];
    if (!existingSerie) return Promise.reject('RECORD_NOT_FOUND');
    if (validationErrors) return Promise.reject('INVALID_DATA');
    return db.query('UPDATE series SET ? WHERE id = ?', [req.body, seriesId]);
  })
    .then(() => {
      res.status(200).json({ ...existingSerie, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === 'RECORD_NOT_FOUND')
        res.status(404).send(`Ser with id ${seriesId} not found.`);
      else if (err === 'INVALID_DATA')
        res.status(422).json({ validationErrors });
      else res.status(500).send('Error updating a movie');
    });
});

app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  connection.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
    err
      ? res.status(500).send("Error deleting an user").json(err)
      : res.status(200).send("User deleted!");
  });
});

app.delete("/api/series/:id", (req, res) => {
  const serieId = req.params.id;
  connection.query("DELETE FROM series WHERE id = ?", [serieId], (err) => {
    err
      ? res.status(500).send("Error deleting an serie").json(err)
      : res.status(200).send("Serie deleted!");
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
