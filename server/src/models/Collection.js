const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Collection', {
  title: { type: DataTypes.STRING(180), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  introduction: { type: DataTypes.TEXT, allowNull: true },
  coverImage: { type: DataTypes.TEXT, allowNull: true },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'collections', underscored: true, timestamps: true, indexes: [{ fields: ['published', 'featured'] }] });
