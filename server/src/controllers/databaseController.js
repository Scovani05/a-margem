const { Op, QueryTypes } = require('sequelize');
const { sequelize, User } = require('../models');
const audit = require('../utils/audit');

// Explorador da base de dados para administradores.
// Usa os modelos Sequelize como "lista branca": só tabelas e colunas conhecidas são acessíveis.

const HIDDEN_FIELDS = new Set(['passwordHash', 'resetTokenHash', 'resetTokenExpiresAt', 'tokenVersion', 'unsubscribeToken']);
const READ_ONLY_TABLES = new Set(['audit_logs']);
// Na tabela de utilizadores só se editam dados de perfil. Perfis e palavras-passe geram-se nas áreas próprias.
const EDITABLE_OVERRIDE = { users: new Set(['name', 'bio']) };
const SENSITIVE_SQL = /(password_hash|reset_token_hash|reset_token_expires_at|token_version|unsubscribe_token)/i;

const tables = () => Object.values(sequelize.models)
  .map((model) => ({ model, table: model.getTableName() }))
  .map(({ model, table }) => ({ model, table: typeof table === 'string' ? table : table.tableName }))
  .sort((a, b) => a.table.localeCompare(b.table));

const findTable = (name) => tables().find((entry) => entry.table === name);

function typeName(attribute) {
  const key = attribute.type?.key || attribute.type?.constructor?.key || 'UNKNOWN';
  return key === 'ARRAY' ? `ARRAY<${attribute.type.type?.key || '?'}>` : key;
}

function columnsFor(model, table) {
  return Object.entries(model.rawAttributes)
    .filter(([name]) => !HIDDEN_FIELDS.has(name))
    .map(([name, attribute]) => {
      const readOnly = READ_ONLY_TABLES.has(table) || attribute.primaryKey || ['createdAt', 'updatedAt'].includes(name)
        || (EDITABLE_OVERRIDE[table] && !EDITABLE_OVERRIDE[table].has(name));
      return {
        name, column: attribute.field || name, type: typeName(attribute),
        allowNull: attribute.allowNull !== false, primaryKey: Boolean(attribute.primaryKey), editable: !readOnly
      };
    });
}

const visibleAttributes = (model) => Object.keys(model.rawAttributes).filter((name) => !HIDDEN_FIELDS.has(name));

const overview = async (req, res, next) => {
  try {
    const entries = await Promise.all(tables().map(async ({ model, table }) => ({
      table, model: model.name, rows: await model.count(), columns: columnsFor(model, table),
      readOnly: READ_ONLY_TABLES.has(table)
    })));
    const [info] = await sequelize.query(
      "SELECT current_database() AS database, pg_size_pretty(pg_database_size(current_database())) AS size, split_part(version(), ' ', 2) AS version",
      { type: QueryTypes.SELECT }
    );
    const migrations = await sequelize.query('SELECT name, applied_at AS "appliedAt" FROM schema_migrations ORDER BY name', { type: QueryTypes.SELECT }).catch(() => []);
    return res.json({ info, tables: entries, migrations });
  } catch (error) { return next(error); }
};

function searchWhere(model, q) {
  const text = String(q || '').trim().slice(0, 100);
  if (!text) return {};
  const conditions = [];
  for (const [name, attribute] of Object.entries(model.rawAttributes)) {
    if (HIDDEN_FIELDS.has(name)) continue;
    const key = attribute.type?.key;
    if (['STRING', 'TEXT', 'CITEXT'].includes(key)) conditions.push({ [name]: { [Op.iLike]: `%${text.replace(/[\\%_]/g, '\\$&')}%` } });
    if (key === 'INTEGER' && /^\d{1,9}$/.test(text)) conditions.push({ [name]: Number(text) });
  }
  return conditions.length ? { [Op.or]: conditions } : { id: -1 };
}

const rows = async (req, res, next) => {
  try {
    const entry = findTable(req.params.table);
    if (!entry) return res.status(404).json({ message: 'Tabela desconhecida.' });
    const { model, table } = entry;
    const attributes = visibleAttributes(model);
    const pageSize = Math.min(100, Math.max(5, Number.parseInt(req.query.pageSize, 10) || 25));
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const sort = attributes.includes(req.query.sort) ? req.query.sort : (attributes.includes('id') ? 'id' : attributes[0]);
    const dir = req.query.dir === 'asc' ? 'ASC' : 'DESC';
    const where = searchWhere(model, req.query.q);
    const { rows: records, count } = await model.findAndCountAll({ attributes, where, order: [[sort, dir]], limit: pageSize, offset: (page - 1) * pageSize });
    return res.json({ table, columns: columnsFor(model, table), rows: records, total: count, page, pageSize, pages: Math.max(1, Math.ceil(count / pageSize)), sort, dir: dir.toLowerCase() });
  } catch (error) { return next(error); }
};

function coerce(attribute, value) {
  if (value === '' || value === null) return attribute.allowNull === false ? value : null;
  const key = attribute.type?.key;
  if (key === 'INTEGER') return Number(value);
  if (key === 'BOOLEAN') return value === true || value === 'true';
  if (key === 'JSONB' || key === 'JSON') return typeof value === 'string' ? JSON.parse(value) : value;
  if (key === 'ARRAY') return Array.isArray(value) ? value : String(value).split(',').map((item) => item.trim()).filter(Boolean);
  return value;
}

const updateRow = async (req, res, next) => {
  try {
    const entry = findTable(req.params.table);
    if (!entry) return res.status(404).json({ message: 'Tabela desconhecida.' });
    const { model, table } = entry;
    if (READ_ONLY_TABLES.has(table)) return res.status(403).json({ message: 'Esta tabela é só de leitura.' });
    const record = await model.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
    const editable = columnsFor(model, table).filter((column) => column.editable).map((column) => column.name);
    const values = {};
    for (const [name, value] of Object.entries(req.body || {})) {
      if (!editable.includes(name)) continue;
      try { values[name] = coerce(model.rawAttributes[name], value); } catch { return res.status(400).json({ message: `O campo ${name} tem um formato inválido.` }); }
    }
    if (!Object.keys(values).length) return res.status(400).json({ message: 'Não há campos editáveis para guardar.' });
    const before = Object.fromEntries(Object.keys(values).map((name) => [name, record.get(name)]));
    await record.update(values);
    await audit(req, 'database.update', { entity: table, entityId: record.id, details: { fields: Object.keys(values), before } });
    return res.json(Object.fromEntries(visibleAttributes(model).map((name) => [name, record.get(name)])));
  } catch (error) { return next(error); }
};

const deleteRow = async (req, res, next) => {
  try {
    const entry = findTable(req.params.table);
    if (!entry) return res.status(404).json({ message: 'Tabela desconhecida.' });
    const { model, table } = entry;
    if (READ_ONLY_TABLES.has(table)) return res.status(403).json({ message: 'Esta tabela é só de leitura.' });
    const record = await model.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
    if (table === 'users') {
      if (record.id === req.user.id) return res.status(409).json({ message: 'Não podes apagar a tua própria conta a partir daqui.' });
      if (record.role === 'admin' && await User.count({ where: { role: 'admin' } }) <= 1) return res.status(409).json({ message: 'É necessário manter pelo menos uma conta administradora.' });
    }
    await record.destroy();
    await audit(req, 'database.delete', { entity: table, entityId: req.params.id });
    return res.status(204).end();
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') return res.status(409).json({ message: 'Este registo está a ser usado noutra tabela e não pode ser apagado.' });
    return next(error);
  }
};

const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  let text = value instanceof Date ? value.toISOString() : typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; // evita injeção de fórmulas no Excel
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const exportCsv = async (req, res, next) => {
  try {
    const entry = findTable(req.params.table);
    if (!entry) return res.status(404).json({ message: 'Tabela desconhecida.' });
    const { model, table } = entry;
    const attributes = visibleAttributes(model);
    const records = await model.findAll({ attributes, where: searchWhere(model, req.query.q), order: [[attributes.includes('id') ? 'id' : attributes[0], 'ASC']], limit: 10000, raw: true });
    const lines = [attributes.join(','), ...records.map((record) => attributes.map((name) => csvCell(record[name])).join(','))];
    await audit(req, 'database.export', { entity: table, details: { rows: records.length } });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${table}-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(`﻿${lines.join('\n')}`);
  } catch (error) { return next(error); }
};

// Consola SQL só de leitura: uma única instrução SELECT/WITH/EXPLAIN numa transação READ ONLY com limite de tempo.
const query = async (req, res, next) => {
  const sql = String(req.body?.sql || '').trim().replace(/;\s*$/, '');
  if (!sql) return res.status(400).json({ message: 'Escreve uma consulta SQL.' });
  if (sql.length > 4000) return res.status(400).json({ message: 'A consulta é demasiado longa.' });
  if (!/^(select|with|explain)\b/i.test(sql)) return res.status(400).json({ message: 'Só são permitidas consultas de leitura (SELECT, WITH ou EXPLAIN).' });
  if (sql.includes(';')) return res.status(400).json({ message: 'Executa apenas uma instrução de cada vez.' });
  if (SENSITIVE_SQL.test(sql)) return res.status(400).json({ message: 'A consulta referencia colunas protegidas (palavras-passe ou tokens).' });
  if (/\b(pg_read_file|pg_ls_dir|pg_read_binary_file|lo_import|lo_export|dblink|pg_sleep|set_config)\b/i.test(sql)) return res.status(400).json({ message: 'Esta função não está disponível na consola.' });
  try {
    const started = Date.now();
    const result = await sequelize.transaction(async (transaction) => {
      await sequelize.query('SET TRANSACTION READ ONLY', { transaction });
      await sequelize.query("SET LOCAL statement_timeout = '5s'", { transaction });
      // EXPLAIN não pode ser usado como subconsulta; corre-o diretamente.
      if (/^explain\b/i.test(sql)) return sequelize.query(sql, { transaction, type: QueryTypes.SELECT });
      return sequelize.query(`SELECT * FROM (${sql}) AS consulta LIMIT 500`, { transaction, type: QueryTypes.SELECT });
    });
    // Segunda barreira: remove colunas protegidas e oculta valores com aspeto de hash/token (ex.: row_to_json).
    const redacted = JSON.parse(JSON.stringify(result).replace(/\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/g, '[protegido]').replace(/\b[a-f0-9]{64}\b/g, '[protegido]'));
    const rowsOut = redacted.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !SENSITIVE_SQL.test(key))));
    await audit(req, 'database.query', { entity: 'sql', details: { sql: sql.slice(0, 500), rows: rowsOut.length } });
    return res.json({ columns: rowsOut[0] ? Object.keys(rowsOut[0]) : [], rows: rowsOut, rowCount: rowsOut.length, ms: Date.now() - started, truncated: rowsOut.length === 500 });
  } catch (error) {
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: `Erro na consulta: ${error.parent?.message || error.message}` });
    return next(error);
  }
};

module.exports = { overview, rows, updateRow, deleteRow, exportCsv, query, HIDDEN_FIELDS };
