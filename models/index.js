const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./users')(sequelize, Sequelize);


const db = {
  sequelize,
  Sequelize,
  User
};

// Define associations
if (User.associate) {
  User.associate(db);
}

module.exports = db;
