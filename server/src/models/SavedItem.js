const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('SavedItem', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  contentType: { type: DataTypes.STRING(24), allowNull: false },
  contentId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'saved_items', underscored: true, timestamps: true, indexes: [{ unique: true, fields: ['user_id', 'content_type', 'content_id'] }] });
