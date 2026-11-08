const { DataTypes } = require('sequelize');

// Perfis "cliente" e "admin", controlo de sessões e registo de auditoria.
async function up(qi) {
  await qi.sequelize.query("UPDATE users SET role = 'cliente' WHERE role NOT IN ('admin', 'cliente')");
  await qi.changeColumn('users', 'role', { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'cliente' });
  await qi.sequelize.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('cliente', 'admin'))");
  await qi.addColumn('users', 'token_version', { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 });
  await qi.addColumn('users', 'failed_login_attempts', { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 });
  await qi.addColumn('users', 'locked_until', { type: DataTypes.DATE, allowNull: true });
  await qi.addColumn('users', 'last_login_at', { type: DataTypes.DATE, allowNull: true });

  await qi.createTable('audit_logs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    user_email: { type: DataTypes.STRING(254), allowNull: true },
    action: { type: DataTypes.STRING(60), allowNull: false },
    entity: { type: DataTypes.STRING(60), allowNull: true },
    entity_id: { type: DataTypes.STRING(60), allowNull: true },
    details: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    ip: { type: DataTypes.STRING(64), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await qi.addIndex('audit_logs', ['created_at']);
  await qi.addIndex('audit_logs', ['action']);
}

async function down(qi) {
  await qi.dropTable('audit_logs');
  for (const column of ['last_login_at', 'locked_until', 'failed_login_attempts', 'token_version']) await qi.removeColumn('users', column);
  await qi.sequelize.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
  await qi.sequelize.query("UPDATE users SET role = 'user' WHERE role = 'cliente'");
  await qi.changeColumn('users', 'role', { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'user' });
}

module.exports = { up, down };
