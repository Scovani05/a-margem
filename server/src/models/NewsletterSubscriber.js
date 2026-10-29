const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('NewsletterSubscriber', {
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  consent: { type: DataTypes.BOOLEAN, allowNull: false },
  consentAt: { type: DataTypes.DATE, allowNull: false },
  unsubscribeToken: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  unsubscribedAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'newsletter_subscribers', underscored: true, timestamps: true });
