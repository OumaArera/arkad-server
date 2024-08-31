const express = require('express');
const db = require('./models');
const signup = require("./authentication/signup");
const cors = require('cors'); 
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

// Body parsing middleware
app.use(express.json());

// Define routes
app.use('/users/signup', signup);




app.get('/', (req, res) => {
  res.send('Hello World!');
});

db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
