const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./users')(sequelize, Sequelize);
const Message = require("./messages")(sequelize, Sequelize);
const Subscription = require("./subription")(sequelize, Sequelize);
const Achievement = require("./achievements")(sequelize, Sequelize);
const Activity = require("./activities")(sequelize, Sequelize);
const Media = require("./media")(sequelize, Sequelize);
const Member = require("./members")(sequelize, Sequelize);
const Partner = require("./partners")(sequelize, Sequelize);
const Newsletter = require("./newsletter")(sequelize, Sequelize);
const Leadership = require("./leadership")(sequelize, Sequelize);
const Volunteer = require("./volunteer")(sequelize, Sequelize);

const db = {
  sequelize,
  Sequelize,
  User,
  Message,
  Subscription,
  Achievement,
  Activity,
  Media,
  Member,
  Partner,
  Newsletter,
  Leadership,
  Volunteer
};

// Define associations
if (User.associate) User.associate(db);
if(Message.associate) Message.associate(db);
if(Subscription.associate) Subscription.associate(db);
if(Achievement.associate) Achievement.associate(db);
if(Activity.associate) Activity.associate(db);
if(Media.associate) Media.associate(db);
if(Member.associate) Member.associate(db);
if(Partner.associate) Partner.associate(db);
if(Newsletter.associate) Newsletter.associate(db);
if(Leadership.associate) Leadership.associate(db);
if(Volunteer.associate) Volunteer.associate(db);

module.exports = db;
