const pg = require('pg');
const dotenv = require('dotenv');
const { certificate } = require('./certificate');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: certificate,
  },
};

const client = new pg.Client(config);
client.connect(function (err) {
  console.log("Successfully connected to DB");
  if (err) throw err;
  client.query('SELECT VERSION()', [], function (err, result) {
    if (err) throw err;
    console.log(result.rows[0]);
    client.end(function (err) {
      if (err) throw err;
    });
  });
});

