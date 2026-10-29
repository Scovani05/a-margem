const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('ContentRelation', {
  sourceType: { type: DataTypes.STRING(24), allowNull: false },
  sourceId: { type: DataTypes.INTEGER, allowNull: false },
  targetType: { type: DataTypes.STRING(24), allowNull: false },
  targetId: { type: DataTypes.INTEGER, allowNull: false },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { tableName: 'content_relations', underscored: true, timestamps: true, indexes: [{ unique: true, fields: ['source_type', 'source_id', 'target_type', 'target_id'] }] });
