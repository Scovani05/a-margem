const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Perfis disponíveis: "cliente" (conta normal) e "admin" (backoffice e base de dados).
const ROLES = ['cliente', 'admin'];

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'cliente', validate: { isIn: [ROLES] } },
  bio: { type: DataTypes.TEXT, allowNull: true },
  resetTokenHash: { type: DataTypes.STRING, allowNull: true },
  resetTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },
  tokenVersion: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  failedLoginAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  lockedUntil: { type: DataTypes.DATE, allowNull: true },
  lastLoginAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'users', underscored: true, timestamps: true });

User.ROLES = ROLES;
module.exports = User;
