const express = require('express');
const db = require('./models');
const signup = require("./authentication/signup");
const login = require("./authentication/login");
const forgotPassword = require("./authentication/forgotPassword");
const changePassword = require('./authentication/changePassword');
const postMessage = require("./messages/postMessages");
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
app.use("/users/login", login);
app.use("/users/reset-password", forgotPassword);
app.use('/users/change-password', changePassword);
app.use("/users/message", postMessage);

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
