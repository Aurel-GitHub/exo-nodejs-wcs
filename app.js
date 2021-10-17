const connection = require("./db-config");
const express = require("express");
const app = express();
const { setupRoutes } = require('./routes/index.routes');
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

setupRoutes(app);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
