const { DataTypes } = require('sequelize');

// Texto completo para cada conteúdo (a "descrição" passa a ser o resumo curto)
// e informação sobre bilhetes nos eventos: onde comprar e ligação direta.
async function up(qi) {
  for (const table of ['events', 'works', 'artists', 'venues']) {
    await qi.addColumn(table, 'body', { type: DataTypes.TEXT, allowNull: true });
  }
  await qi.addColumn('events', 'ticket_info', { type: DataTypes.TEXT, allowNull: true });
  await qi.addColumn('events', 'ticket_url', { type: DataTypes.TEXT, allowNull: true });
}

async function down(qi) {
  await qi.removeColumn('events', 'ticket_url');
  await qi.removeColumn('events', 'ticket_info');
  for (const table of ['events', 'works', 'artists', 'venues']) await qi.removeColumn(table, 'body');
}

module.exports = { up, down };
