const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Article', {
  title: { type: DataTypes.STRING(220), allowNull: false },
  slug: { type: DataTypes.STRING(240), allowNull: false, unique: true },
  subtitle: { type: DataTypes.STRING(240), allowNull: true },
  excerpt: { type: DataTypes.TEXT, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: true },
  authorName: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'Redação À Margem' },
  imageUrl: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'draft' },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
  isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'articles', underscored: true, timestamps: true, indexes: [{ fields: ['status', 'published_at'] }] });
