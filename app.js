const connection = require("./db-config");
const express = require("express");
const app = express();

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
  connection.query(
    "INSERT INTO series(title, director, year, color, nbEpisodes, nbSeasons) VALUES (?, ?, ?, ?, ?, ?)",
    [title, director, year, color, nbEpisodes, nbSeasons],
    (err, result) => {
     if (err) {
       res.status(500).send('Error saving the user');
     } else {
       const id = result.insertId;
       const createdSeries = { id, title, director, year, color, nbEpisodes, nbSeasons };
       res.status(201).json(createdSeries);
     }
    }
  );
});

app.post("/api/users", (req, res) => {
  const { firstname, lastname, email } = req.body;
  connection.query(
    "INSERT INTO users(firstname, lastname, email) VALUES (?, ?, ?)",
    [firstname, lastname, email],
    (err, result) => {
      if (err) {
        res.status(500).send("Error saving the user");
      } else {
        const id = result.insertId;
        const createdUser = { id, firstname, lastname, email };
        res.status(201).json(createdUser);
      }
    }
  );
});

app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const db = connection.promise();
  let existingUser = null;
  db.query("SELECT * FROM users WHERE id = ?", [userId])
    .then(([results]) => {
      existingUser = results[0];
      if (!existingUser) return Promise.reject("RECORD_NOT_FOUND");
      return db.query("UPDATE users SET ? WHERE id = ?", [req.body, userId]);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`User with id ${userId} not found.`);
      else res.status(500).send("Error updating a user");
    });
});

app.put("/api/series/:id", (req, res) => {
  const seriesId = req.params.id;
  const db = connection.promise();
  let existingSerie = null;
  db.query("SELECT * FROM series WHERE id = ?", [seriesId])
    .then((results) => {
      existingSerie = results[0];
      if (!existingSerie) return Promise.reject("RECORD_NOT_FOUND");
      return db.query("UPDATE series SET ? WHERE id = ?", [req.body, seriesId]);
    })
    .then(() => {
      res.status(200).json({...existingSerie, ...req.body});
    })
    .then(() => {
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`Serie with id ${seriesId} not found.`);
      else res.status(500).send('Error updating a serie');
    })
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
