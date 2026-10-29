require('dotenv').config();
// Neon transaction poolers are for application traffic. Use the direct URL
// for schema changes when one is configured.
if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const migration = require('./001-initial-schema');
const migrationName = '001-initial-schema';

async function run() {
  const direction = process.argv[2] || 'up';
  if (!['up', 'down'].includes(direction)) throw new Error('Use migration direction "up" or "down".');
  await sequelize.authenticate();
  await sequelize.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(160) PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  const applied = await sequelize.query('SELECT name FROM schema_migrations WHERE name = :name', {
    replacements: { name: migrationName }, type: QueryTypes.SELECT
  });
  const qi = sequelize.getQueryInterface();
  if (direction === 'up' && applied.length === 0) {
    await migration.up(qi);
    await sequelize.query('INSERT INTO schema_migrations (name) VALUES (:name)', { replacements: { name: migrationName } });
    console.log(`Applied ${migrationName}`);
  } else if (direction === 'down' && applied.length > 0) {
    await migration.down(qi);
    await sequelize.query('DELETE FROM schema_migrations WHERE name = :name', { replacements: { name: migrationName } });
    console.log(`Reverted ${migrationName}`);
  } else {
    console.log(direction === 'up' ? 'Database schema is up to date.' : 'No migration to roll back.');
  }
}

run().catch((error) => {
  console.error('Database migration failed:', error.message);
  process.exitCode = 1;
}).finally(() => sequelize.close());
