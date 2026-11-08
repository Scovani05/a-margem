const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('AuditLog', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  userEmail: { type: DataTypes.STRING(254), allowNull: true },
  action: { type: DataTypes.STRING(60), allowNull: false },
  entity: { type: DataTypes.STRING(60), allowNull: true },
  entityId: { type: DataTypes.STRING(60), allowNull: true },
  details: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  ip: { type: DataTypes.STRING(64), allowNull: true }
}, { tableName: 'audit_logs', underscored: true, timestamps: true, indexes: [{ fields: ['created_at'] }, { fields: ['action'] }] });
