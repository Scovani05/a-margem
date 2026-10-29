const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Category', {
  name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(240), allowNull: false, defaultValue: '' },
  color: { type: DataTypes.STRING(24), allowNull: false, defaultValue: '#d4ec5b' },
  icon: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'sparkles' },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { tableName: 'categories', underscored: true, timestamps: true });
