const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Work', {
  title: { type: DataTypes.STRING(180), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  subtitle: { type: DataTypes.STRING(240), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING(40), allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  creator: { type: DataTypes.STRING(180), allowNull: true },
  imageUrl: { type: DataTypes.TEXT, allowNull: true },
  releasedAt: { type: DataTypes.DATEONLY, allowNull: true },
  officialUrl: { type: DataTypes.TEXT, allowNull: true },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'works', underscored: true, timestamps: true, indexes: [{ fields: ['type'] }, { fields: ['published', 'featured'] }] });
