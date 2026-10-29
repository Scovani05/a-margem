require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const port = Number(process.env.PORT || 4000);

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || /^(replace|change|your-)/i.test(process.env.JWT_SECRET)) throw new Error('Set JWT_SECRET to a random value with at least 32 characters.');
  await sequelize.authenticate();
  const server = app.listen(port, () => console.log(`À Margem API listening on port ${port}`));
  const shutdown = async () => {
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Could not start À Margem API:', error.message);
  process.exit(1);
});
