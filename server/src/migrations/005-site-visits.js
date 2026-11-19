const { DataTypes } = require('sequelize');

// Visitas ao site: um registo por visitante anónimo e por dia (hora de Lisboa).
// Guarda só um hash do identificador do navegador, nunca o IP nem dados pessoais.
async function up(qi) {
  await qi.createTable('site_visits', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    visitor_hash: { type: DataTypes.STRING(64), allowNull: false },
    day: { type: DataTypes.DATEONLY, allowNull: false },
    first_path: { type: DataTypes.STRING(300), allowNull: true },
    page_views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await qi.addIndex('site_visits', ['visitor_hash', 'day'], { unique: true, name: 'site_visits_visitor_day' });
  await qi.addIndex('site_visits', ['day'], { name: 'site_visits_day' });
}

async function down(qi) {
  await qi.dropTable('site_visits');
}

module.exports = { up, down };
