const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('User', {
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'user' },
  bio: { type: DataTypes.TEXT, allowNull: true },
  resetTokenHash: { type: DataTypes.STRING, allowNull: true },
  resetTokenExpiresAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'users', underscored: true, timestamps: true });
