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
  connection.query("SELECT * FROM series", (err, result) => {
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

app.post("/api/series", (req, res) => {
  const { title, director, year, color, nbEpisodes, nbSeasons } = req.body;
  connection.query(
    "INSERT INTO series(title, director, year, color, nbEpisodes, nbSeasons) VALUES (?, ?, ?, ?, ?, ?)",
    [title, director, year, color, nbEpisodes, nbSeasons],
    (err, result) => {
      err
        ? res.status(500).send("Error saving the movie")
        : res.status(201).send("Movie successfully saved");
    }
  );
});

app.post("/api/users", (req, res) => {
  const { firstname, lastname, email } = req.body;
  connection.query(
    "INSERT INTO users(firstname, lastname, email) VALUES (?, ?, ?)",
    [firstname, lastname, email],
    (err, result) => {
      err
        ? res.status(500).send("Error saving the user")
        : res.status(201).send("User successfully saved");
    }
  );
});

app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const reqBodyValues = req.body;
  connection.query(
    "UPDATE users SET ? WHERE id = ?",
    [reqBodyValues, userId],
    (err) => {
      err
        ? res.status(500).send("Error updating a user")
        : res.status(200).send("User updated successfully !");
    }
  )
})
app.put("/api/series/:id", (req, res) => {
  const seriesId = req.params.id;
  const reqBodyValues = req.body;
  connection.query(
    "UPDATE series SET ? WHERE id = ?",
    [reqBodyValues, seriesId],
    (err) => {
      err
        ? res.status(500).send("Error updating a series")
        : res.status(200).send("Series updated successfully !");
    }
  )
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
