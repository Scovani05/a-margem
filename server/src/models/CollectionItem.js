const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('CollectionItem', {
  collectionId: { type: DataTypes.INTEGER, allowNull: false },
  contentType: { type: DataTypes.STRING(24), allowNull: false },
  contentId: { type: DataTypes.INTEGER, allowNull: false },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { tableName: 'collection_items', underscored: true, timestamps: true, indexes: [{ unique: true, fields: ['collection_id', 'content_type', 'content_id'] }] });
