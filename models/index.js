const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./users')(sequelize, Sequelize);
const Message = require("./messages")(sequelize, Sequelize);
const Subscription = require("./subription")(sequelize, Sequelize);


const db = {
  sequelize,
  Sequelize,
  User,
  Message,
  Subscription
};

// Define associations
if (User.associate) {
  User.associate(db);
}
if(Message.associate){
  Message.associate(db);
}
if(Subscription.associate){
  Subscription.associate(db);
}

module.exports = db;
