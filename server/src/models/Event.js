const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Event', {
  title: { type: DataTypes.STRING(180), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  subtitle: { type: DataTypes.STRING(240), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  venueId: { type: DataTypes.INTEGER, allowNull: true },
  venueName: { type: DataTypes.STRING(180), allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: false },
  organizer: { type: DataTypes.STRING(180), allowNull: true },
  imageUrl: { type: DataTypes.TEXT, allowNull: true },
  startsAt: { type: DataTypes.DATE, allowNull: false },
  endsAt: { type: DataTypes.DATE, allowNull: true },
  officialUrl: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'upcoming' },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'events', underscored: true, timestamps: true, indexes: [{ fields: ['starts_at'] }, { fields: ['city'] }, { fields: ['published', 'featured'] }] });
