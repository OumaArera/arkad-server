require('dotenv').config(); 
const { ssl } = require('pg/lib/defaults');
const { certificate } = require('./certificate');

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    ssl:true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca:certificate 
      }
    }
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    ssl:true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca:certificate
      }
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    ssl:true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca:certificate
      }
    }
  }
};
