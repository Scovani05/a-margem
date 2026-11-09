const { DataTypes } = require('sequelize');

// Imagens carregadas a partir do computador (guardadas no PostgreSQL, porque o disco do Render
// é apagado a cada deploy) e extensão "unaccent" para a pesquisa ignorar acentos.
async function up(qi) {
  await qi.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent');
  await qi.createTable('media', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    original_name: { type: DataTypes.STRING(200), allowNull: false },
    mime_type: { type: DataTypes.STRING(40), allowNull: false },
    size_bytes: { type: DataTypes.INTEGER, allowNull: false },
    data: { type: DataTypes.BLOB, allowNull: false },
    uploaded_by: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
}

async function down(qi) {
  await qi.dropTable('media');
}

module.exports = { up, down };
