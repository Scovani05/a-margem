const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Imagem carregada pelo backoffice. O conteúdo binário fica na coluna "data" (bytea).
module.exports = sequelize.define('Media', {
  originalName: { type: DataTypes.STRING(200), allowNull: false },
  mimeType: { type: DataTypes.STRING(40), allowNull: false },
  sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
  data: { type: DataTypes.BLOB, allowNull: false },
  uploadedBy: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'media', underscored: true, timestamps: true });
