const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgres://test:test@127.0.0.1:5432/test';
const router = require('../src/routes');

const hasRoute = (method, path) => router.stack.some((layer) => layer.route?.path === path && layer.route.methods[method]);

test('registers public catalogue, search, authentication, and moderation endpoints', () => {
  for (const resource of ['events', 'works', 'artists', 'venues', 'articles', 'collections']) {
    assert.ok(hasRoute('get', `/${resource}`));
    assert.ok(hasRoute('get', `/${resource}/:slug`));
  }
  assert.ok(hasRoute('get', '/search'));
  assert.ok(hasRoute('post', '/auth/register'));
  assert.ok(hasRoute('post', '/auth/login'));
  assert.ok(hasRoute('get', '/saved'));
  assert.ok(hasRoute('post', '/submissions'));
  assert.ok(hasRoute('post', '/admin/submissions/:id/publish'));
});

test('keeps administrator routes behind authentication and the admin role check', () => {
  const dashboard = router.stack.find((layer) => layer.route?.path === '/admin/dashboard').route;
  assert.equal(dashboard.stack.length, 3);
  const middlewareNames = dashboard.stack.map((entry) => entry.name);
  assert.ok(middlewareNames.includes('requireAuth'));
  assert.ok(middlewareNames.includes('requireAdmin'));
});
