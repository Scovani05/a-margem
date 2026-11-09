const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Venue', {
  name: { type: DataTypes.STRING(180), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  type: { type: DataTypes.STRING(60), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  address: { type: DataTypes.STRING(240), allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: false },
  website: { type: DataTypes.TEXT, allowNull: true },
  publicEmail: { type: DataTypes.STRING(254), allowNull: true },
  links: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  imageUrl: { type: DataTypes.TEXT, allowNull: true },
  body: { type: DataTypes.TEXT, allowNull: true },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'venues', underscored: true, timestamps: true, indexes: [{ fields: ['city'] }, { fields: ['published', 'featured'] }] });
