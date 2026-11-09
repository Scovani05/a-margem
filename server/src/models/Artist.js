const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Artist', {
  name: { type: DataTypes.STRING(160), allowNull: false },
  slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
  bio: { type: DataTypes.TEXT, allowNull: false },
  location: { type: DataTypes.STRING(120), allowNull: true },
  disciplines: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
  links: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  imageUrl: { type: DataTypes.TEXT, allowNull: true },
  body: { type: DataTypes.TEXT, allowNull: true },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'artists', underscored: true, timestamps: true, indexes: [{ fields: ['location'] }, { fields: ['published', 'featured'] }] });
