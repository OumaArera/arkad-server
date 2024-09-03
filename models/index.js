const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./users')(sequelize, Sequelize);
const Message = require("./messages")(sequelize, Sequelize);
const Subscription = require("./subription")(sequelize, Sequelize);
const Achievement = require("./achievements")(sequelize, Sequelize);
const Activity = require("./activities")(sequelize, Sequelize);
const Media = require("./media")(sequelize, Sequelize);


const db = {
  sequelize,
  Sequelize,
  User,
  Message,
  Subscription,
  Achievement,
  Activity,
  Media
};

// Define associations
if (User.associate) User.associate(db);
if(Message.associate) Message.associate(db);
if(Subscription.associate) Subscription.associate(db);
if(Achievement.associate) Achievement.associate(db);
if(Activity.associate) Activity.associate(db);
if(Media.associate) Media.associate(db);

module.exports = db;
