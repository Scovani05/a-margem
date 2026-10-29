const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Copy server/.env.example to server/.env and configure PostgreSQL.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.DATABASE_SSL === 'true'
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {}
});

module.exports = sequelize;
