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

test('keeps every administrator route behind authentication and the admin role check', () => {
  const guard = router.stack.find((layer) => !layer.route && layer.regexp.test('/admin/dashboard'));
  assert.ok(guard, 'expected a router-level guard on /admin');
  const names = router.stack.filter((layer) => !layer.route && layer.regexp.test('/admin/database')).map((layer) => layer.name);
  assert.ok(names.includes('requireAuth'));
  assert.ok(names.includes('requireAdmin'));
  const firstAdminRoute = router.stack.findIndex((layer) => layer.route?.path?.startsWith('/admin'));
  const lastGuard = router.stack.findLastIndex((layer) => !layer.route && layer.name === 'requireAdmin');
  assert.ok(lastGuard < firstAdminRoute, 'guards must be registered before admin routes');
});

test('exposes the database explorer and account security endpoints', () => {
  assert.ok(hasRoute('get', '/admin/database'));
  assert.ok(hasRoute('get', '/admin/database/:table'));
  assert.ok(hasRoute('post', '/admin/database/query'));
  assert.ok(hasRoute('get', '/admin/audit'));
  assert.ok(hasRoute('post', '/auth/change-password'));
  assert.ok(hasRoute('post', '/auth/logout-all'));
  assert.ok(hasRoute('get', '/submissions/mine'));
});
