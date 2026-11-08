const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgres://test:test@127.0.0.1:5432/test';
process.env.JWT_SECRET ||= 'x'.repeat(48);
const jwt = require('jsonwebtoken');
const { passwordProblem } = require('../src/middleware/validate');
const { issueToken } = require('../src/middleware/auth');
const { User } = require('../src/models');
const migration = require('../src/migrations/002-roles-security-audit');
const { HIDDEN_FIELDS } = require('../src/controllers/databaseController');

test('password policy requires length, letters and digits', () => {
  assert.ok(passwordProblem('curta1'));
  assert.ok(passwordProblem('semnumerosaqui'));
  assert.ok(passwordProblem('1234567890123'));
  assert.equal(passwordProblem('margem-2026-ok'), '');
});

test('only the cliente and admin profiles exist', () => {
  assert.deepEqual(User.ROLES, ['cliente', 'admin']);
  assert.equal(User.rawAttributes.role.defaultValue, 'cliente');
});

test('tokens are signed with HS256, scoped and carry the session version', () => {
  const token = issueToken({ id: 7, role: 'cliente', tokenVersion: 3 });
  const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'a-margem-api', audience: 'a-margem-client' });
  assert.equal(payload.sub, 7);
  assert.equal(payload.v, 3);
  assert.throws(() => jwt.verify(token, 'outro-segredo-qualquer-com-32-caracteres', { algorithms: ['HS256'] }));
});

test('database explorer never exposes password hashes or tokens', () => {
  for (const field of ['passwordHash', 'resetTokenHash', 'tokenVersion', 'unsubscribeToken']) assert.ok(HIDDEN_FIELDS.has(field));
});

test('migration 002 adds the audit table and session columns', async () => {
  const created = []; const added = []; const queries = [];
  await migration.up({
    sequelize: { query: async (sql) => queries.push(sql) },
    changeColumn: async () => {}, addColumn: async (table, column) => added.push(`${table}.${column}`),
    createTable: async (name) => created.push(name), addIndex: async () => {}
  });
  assert.ok(created.includes('audit_logs'));
  assert.ok(added.includes('users.token_version'));
  assert.ok(queries.some((sql) => sql.includes("CHECK (role IN ('cliente', 'admin'))")));
});
