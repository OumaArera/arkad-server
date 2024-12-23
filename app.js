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
app.use('/users/users', require('./authentication/getUsers'));
app.use('/users/users', require('./authentication/removeUser'));
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
app.use("/users/achievement", require("./achievements/getAchievement"));
app.use("/users/achievement", require("./achievements/updateAchievement"));
app.use("/users/activities", require("./activities/postActivities"));
app.use("/users/activities", require("./activities/getActivities"));
app.use("/users/activities", require("./activities/updateActivities"));
app.use("/users/activities", require("./activities/removeActivity"));
app.use("/users/media", require("./media/postMedia"));
app.use("/users/media", require("./media/getMedia"));
app.use("/users/media", require("./media/removeMedia"));
app.use("/users/media", require("./media/updateMedia"));
app.use("/users/member", require("./members/newMembers"));
app.use("/users/member", require("./members/getNewMembers"));
app.use("/users/member", require("./members/approveNewMember"));
app.use("/users/member", require('./members/removeMember'));
app.use("/users/all-members", require("./members/getAllMembers"));
app.use("/users/partner", require("./partners/postPartners"));
app.use("/users/partners", require("./partners/getPartners"));
app.use("/users/newsletter", require("./newsletter/postNewsletter"));
app.use("/users/leaders", require("./leadership/postLeader"));
app.use("/users/leaders", require("./leadership/getLeaders"));
app.use("/users/leaders", require("./leadership/putLeaders"));
app.use("/users/leaders", require("./leadership/removeLeader"));
app.use("/users/volunteer", require("./volunteer/createVolunteer"));
app.use("/users/volunteer", require("./volunteer/getVolunteers"));
app.use("/users/donations", require("./payment/donate"));
app.use("/users/donations", require("./payment/getDonations"));
app.use("/users/validate", require("./payment/validate"));
app.use("/users/delete-all-members", require("./members/remove"));

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
