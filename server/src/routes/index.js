const express = require('express');
const auth = require('../controllers/authController');
const catalogue = require('../controllers/catalogueController');
const publicController = require('../controllers/publicController');
const searchController = require('../controllers/searchController');
const savedController = require('../controllers/savedController');
const submissionController = require('../controllers/submissionController');
const newsletterController = require('../controllers/newsletterController');
const adminController = require('../controllers/adminController');
const databaseController = require('../controllers/databaseController');
const { requireAuth, optionalAuth, requireAdmin } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 12, message: 'Muitas tentativas. Espera um pouco e tenta novamente.' });
const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 8 });
const sensitiveLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Muitas tentativas. Espera um pouco e tenta novamente.' });
const adminLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, keyByPath: false });

router.get('/health', (req, res) => res.json({ ok: true, name: 'À Margem API' }));
router.get('/home', publicController.home);
router.get('/categories', publicController.listCategories);
router.get('/search', searchController.search);

for (const resource of ['events', 'works', 'artists', 'venues', 'articles', 'collections']) {
  router.get(`/${resource}`, catalogue.list(resource));
  router.get(`/${resource}/:slug`, catalogue.detail(resource));
}

router.post('/auth/register', authLimiter, auth.register);
router.post('/auth/login', authLimiter, auth.login);
router.get('/auth/me', requireAuth, auth.me);
router.patch('/auth/profile', requireAuth, auth.updateProfile);
router.post('/auth/change-password', requireAuth, sensitiveLimiter, auth.changePassword);
router.post('/auth/logout-all', requireAuth, auth.logoutAll);
router.post('/auth/forgot-password', authLimiter, auth.requestPasswordReset);
router.post('/auth/reset-password', authLimiter, auth.resetPassword);
router.delete('/auth/account', requireAuth, sensitiveLimiter, auth.deleteAccount);

router.get('/saved', requireAuth, savedController.list);
router.post('/saved', requireAuth, savedController.create);
router.delete('/saved/:type/:id', requireAuth, savedController.remove);

router.post('/submissions', submitLimiter, optionalAuth, submissionController.create);
router.get('/submissions/mine', requireAuth, submissionController.mine);
router.post('/newsletter', submitLimiter, newsletterController.subscribe);
router.post('/newsletter/unsubscribe/:token', newsletterController.unsubscribe);
router.post('/contact', submitLimiter, publicController.contact);

// Tudo o que está em /admin exige sessão válida E perfil de administrador.
router.use('/admin', adminLimiter, requireAuth, requireAdmin);
router.get('/admin/dashboard', adminController.dashboard);
const managedResource = (handler) => (req, res, next) => {
  if (!adminController.managed[req.params.resource]) return res.status(404).json({ message: 'Tipo de conteúdo desconhecido.' });
  return handler(req.params.resource)(req, res, next);
};
router.get('/admin/resources/:resource', managedResource(adminController.listResources));
router.post('/admin/resources/:resource', managedResource(adminController.createResource));
router.put('/admin/resources/:resource/:id', managedResource(adminController.updateResource));
router.delete('/admin/resources/:resource/:id', managedResource(adminController.deleteResource));
router.get('/admin/submissions', adminController.listSubmissions);
router.patch('/admin/submissions/:id', adminController.updateSubmission);
router.post('/admin/submissions/:id/publish', adminController.publishSubmission);
router.get('/admin/users', adminController.listUsers);
router.post('/admin/users', adminController.createUser);
router.patch('/admin/users/:id', adminController.updateUserRole);
router.delete('/admin/users/:id', adminController.deleteUser);
router.get('/admin/audit', adminController.listAudit);
router.get('/admin/newsletter', adminController.listNewsletter);
router.delete('/admin/newsletter/:id', adminController.deleteNewsletter);
router.get('/admin/contact', adminController.listContacts);
router.patch('/admin/contact/:id', adminController.updateContact);

// Acesso à base de dados (PostgreSQL via Sequelize) — exclusivo do perfil admin.
router.get('/admin/database', databaseController.overview);
router.post('/admin/database/query', databaseController.query);
router.get('/admin/database/:table', databaseController.rows);
router.get('/admin/database/:table/export', databaseController.exportCsv);
router.put('/admin/database/:table/:id', databaseController.updateRow);
router.delete('/admin/database/:table/:id', databaseController.deleteRow);

module.exports = router;
