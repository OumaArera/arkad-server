const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./users')(sequelize, Sequelize);
const Message = require("./messages")(sequelize, Sequelize);


const db = {
  sequelize,
  Sequelize,
  User,
  Message
};

// Define associations
if (User.associate) {
  User.associate(db);
}
if(Message.associate){
  Message.associate(db);
}

module.exports = db;
