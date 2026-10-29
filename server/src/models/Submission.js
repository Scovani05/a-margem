const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Submission', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  type: { type: DataTypes.STRING(24), allowNull: false },
  title: { type: DataTypes.STRING(180), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: true },
  venueName: { type: DataTypes.STRING(180), allowNull: true },
  startsAt: { type: DataTypes.DATE, allowNull: true },
  officialUrl: { type: DataTypes.TEXT, allowNull: true },
  submitterName: { type: DataTypes.STRING(120), allowNull: false },
  submitterEmail: { type: DataTypes.STRING(254), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' },
  adminNotes: { type: DataTypes.TEXT, allowNull: true },
  publishedContentType: { type: DataTypes.STRING(24), allowNull: true },
  publishedContentId: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'submissions', underscored: true, timestamps: true, indexes: [{ fields: ['status', 'created_at'] }] });
