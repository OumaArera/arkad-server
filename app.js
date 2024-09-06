const express = require('express');
const db = require('./models');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the "public" directory (where images are stored)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Define routes
app.use('/users/signup', require('./authentication/signup'));
app.use('/users/login', require('./authentication/login'));
app.use('/users/reset-password', require('./authentication/forgotPassword'));
app.use('/users/change-password', require('./authentication/changePassword'));
app.use('/users/message', require('./messages/postMessages'));
app.use('/users/message', require('./messages/getMessages'));
app.use('/users/message', require('./messages/manageMessage'));
app.use('/users/subscribe', require('./newsletter/subscribe'));
app.use('/users/achievement', require('./achievements/postAchievements'));
app.use('/users/achievement', require('./achievements/getAchievements'));
app.use("/users/achievement", require("./achievements/removeAchievements"));
app.use("/users/achievement", require("./achievements/updateAchievement"));
app.use("/users/activities", require("./activities/postActivities"));
app.use("/users/activities", require("./activities/getActivities"));
app.use("/users/activities", require("./activities/updateActivities"));
app.use("/users/media", require("./media/postMedia"));
app.use("/users/media", require("./media/getMedia"));
app.use("/users/member", require("./members/newMembers"));
app.use("/users/member", require("./members/getNewMembers"));
app.use("/users/member", require("./members/approveNewMember"));
app.use("/users/all-members", require("./members/getAllMembers"));

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
