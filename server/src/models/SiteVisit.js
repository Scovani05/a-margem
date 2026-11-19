const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Um registo por visitante anónimo e por dia. Ver controllers/visitController.js.
module.exports = sequelize.define('SiteVisit', {
  visitorHash: { type: DataTypes.STRING(64), allowNull: false },
  day: { type: DataTypes.DATEONLY, allowNull: false },
  firstPath: { type: DataTypes.STRING(300), allowNull: true },
  pageViews: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
}, { tableName: 'site_visits', underscored: true, timestamps: true, indexes: [{ unique: true, fields: ['visitor_hash', 'day'] }, { fields: ['day'] }] });
