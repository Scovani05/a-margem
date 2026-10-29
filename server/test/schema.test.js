const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgres://test:test@127.0.0.1:5432/test';
const models = require('../src/models');
const migration = require('../src/migrations/001-initial-schema');
const catalogue = require('../src/services/catalogueService');

test('Sequelize models expose the required cultural relationships', () => {
  assert.ok(models.Event.associations.category);
  assert.ok(models.Event.associations.venue);
  assert.ok(models.Work.associations.category);
  assert.ok(models.Article.associations.category);
  assert.ok(models.Collection.associations.items);
  assert.ok(models.ContentRelation);
  assert.ok(models.SavedItem.rawAttributes.userId);
});

test('public query scopes exclude unpublished content and drafts', () => {
  assert.deepEqual(catalogue.publicWhere('events'), { published: true });
  assert.deepEqual(catalogue.publicWhere('articles'), { status: 'published' });
});

test('initial migration creates the catalogue, account, and moderation tables', async () => {
  const tables = [];
  const indexes = [];
  await migration.up({
    async createTable(name, columns) { tables.push({ name, columns }); },
    async addIndex(name, fields, options) { indexes.push({ name, fields, options }); }
  });
  for (const table of ['users', 'categories', 'events', 'works', 'artists', 'venues', 'articles', 'collections', 'collection_items', 'content_relations', 'saved_items', 'submissions', 'newsletter_subscribers', 'contact_messages']) {
    assert.ok(tables.some((entry) => entry.name === table), `expected ${table} table`);
  }
  assert.equal(tables.length, 14);
  assert.ok(indexes.some((entry) => entry.name === 'saved_items' && entry.options.unique));
  assert.ok(indexes.some((entry) => entry.name === 'content_relations' && entry.options.unique));
  assert.ok(indexes.some((entry) => entry.name === 'events' && entry.fields.includes('starts_at')));
});
