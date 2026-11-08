require('dotenv').config();
// Neon transaction poolers are for application traffic. Use the direct URL
// for schema changes when one is configured.
if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

// Ordem de aplicação das migrações (adicionar novas no fim da lista).
const migrations = [
  ['001-initial-schema', require('./001-initial-schema')],
  ['002-roles-security-audit', require('./002-roles-security-audit')]
];

async function run() {
  const direction = process.argv[2] || 'up';
  if (!['up', 'down'].includes(direction)) throw new Error('Use migration direction "up" or "down".');
  await sequelize.authenticate();
  await sequelize.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(160) PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  const applied = new Set((await sequelize.query('SELECT name FROM schema_migrations', { type: QueryTypes.SELECT })).map((row) => row.name));
  const qi = sequelize.getQueryInterface();

  if (direction === 'up') {
    const pending = migrations.filter(([name]) => !applied.has(name));
    if (!pending.length) return console.log('Database schema is up to date.');
    for (const [name, migration] of pending) {
      await migration.up(qi);
      await sequelize.query('INSERT INTO schema_migrations (name) VALUES (:name)', { replacements: { name } });
      console.log(`Applied ${name}`);
    }
    return undefined;
  }

  const last = [...migrations].reverse().find(([name]) => applied.has(name));
  if (!last) return console.log('No migration to roll back.');
  await last[1].down(qi);
  await sequelize.query('DELETE FROM schema_migrations WHERE name = :name', { replacements: { name: last[0] } });
  return console.log(`Reverted ${last[0]}`);
}

run().catch((error) => {
  console.error('Database migration failed:', error.message);
  process.exitCode = 1;
}).finally(() => sequelize.close());
