const express = require('express');
const auth = require('../controllers/authController');
const catalogue = require('../controllers/catalogueController');
const publicController = require('../controllers/publicController');
const searchController = require('../controllers/searchController');
const savedController = require('../controllers/savedController');
const submissionController = require('../controllers/submissionController');
const newsletterController = require('../controllers/newsletterController');
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 12, message: 'Muitas tentativas. Espera um pouco e tenta novamente.' });
const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 8 });

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
router.post('/auth/forgot-password', authLimiter, auth.requestPasswordReset);
router.post('/auth/reset-password', authLimiter, auth.resetPassword);
router.delete('/auth/account', requireAuth, auth.deleteAccount);

router.get('/saved', requireAuth, savedController.list);
router.post('/saved', requireAuth, savedController.create);
router.delete('/saved/:type/:id', requireAuth, savedController.remove);

router.post('/submissions', submitLimiter, submissionController.create);
router.post('/newsletter', submitLimiter, newsletterController.subscribe);
router.post('/newsletter/unsubscribe/:token', newsletterController.unsubscribe);
router.post('/contact', submitLimiter, publicController.contact);

router.get('/admin/dashboard', requireAuth, requireAdmin, adminController.dashboard);
router.get('/admin/resources/:resource', requireAuth, requireAdmin, (req, res, next) => {
  if (!adminController.managed[req.params.resource]) return res.status(404).json({ message: 'Tipo de conteúdo desconhecido.' });
  return adminController.listResources(req.params.resource)(req, res, next);
});
router.post('/admin/resources/:resource', requireAuth, requireAdmin, (req, res, next) => {
  if (!adminController.managed[req.params.resource]) return res.status(404).json({ message: 'Tipo de conteúdo desconhecido.' });
  return adminController.createResource(req.params.resource)(req, res, next);
});
router.put('/admin/resources/:resource/:id', requireAuth, requireAdmin, (req, res, next) => {
  if (!adminController.managed[req.params.resource]) return res.status(404).json({ message: 'Tipo de conteúdo desconhecido.' });
  return adminController.updateResource(req.params.resource)(req, res, next);
});
router.delete('/admin/resources/:resource/:id', requireAuth, requireAdmin, (req, res, next) => {
  if (!adminController.managed[req.params.resource]) return res.status(404).json({ message: 'Tipo de conteúdo desconhecido.' });
  return adminController.deleteResource(req.params.resource)(req, res, next);
});
router.get('/admin/submissions', requireAuth, requireAdmin, adminController.listSubmissions);
router.patch('/admin/submissions/:id', requireAuth, requireAdmin, adminController.updateSubmission);
router.post('/admin/submissions/:id/publish', requireAuth, requireAdmin, adminController.publishSubmission);
router.get('/admin/users', requireAuth, requireAdmin, adminController.listUsers);
router.patch('/admin/users/:id', requireAuth, requireAdmin, adminController.updateUserRole);
router.get('/admin/newsletter', requireAuth, requireAdmin, adminController.listNewsletter);
router.delete('/admin/newsletter/:id', requireAuth, requireAdmin, adminController.deleteNewsletter);
router.get('/admin/contact', requireAuth, requireAdmin, adminController.listContacts);
router.patch('/admin/contact/:id', requireAuth, requireAdmin, adminController.updateContact);

module.exports = router;
