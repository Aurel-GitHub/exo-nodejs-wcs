const connection = require('./db-config');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

connection.connect((err) => {
  if (err)  {
    console.error('error connection: ' + err.stack);
  } else {
    console.log('Connected to database with thredId: ' + connection.threadId);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/api/series', (req,res) => {
  connection.query('SELECT * FROM series', (err,result) => {
    err ? res.status(500).json('Error retrieving data from database') : res.status(200).json(result);
  })
})