const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Copy server/.env.example to server/.env and configure PostgreSQL.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  // Ligações TLS validam o certificado do servidor (o Neon usa certificados públicos).
  dialectOptions: process.env.DATABASE_SSL === 'true'
    ? { ssl: { require: true, rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } }
    : {},
  pool: { max: Number(process.env.DATABASE_POOL_MAX || 5), idle: 10000 }
});

module.exports = sequelize;
