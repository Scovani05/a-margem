const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize, Category, Event, Work, Artist, Venue, Article, Collection, CollectionItem, ContentRelation, Submission, NewsletterSubscriber, ContactMessage, User, AuditLog, SavedItem } = require('../models');
const { isHttpUrl, isSafeAssetRef, isEmail, cleanText, passwordProblem } = require('../middleware/validate');
const slugify = require('../utils/slugify');
const audit = require('../utils/audit');

const managed = {
  categories: { model: Category, fields: ['name', 'slug', 'description', 'color', 'icon', 'sortOrder'], slugSource: 'name' },
  events: { model: Event, fields: ['title', 'slug', 'subtitle', 'description', 'categoryId', 'venueId', 'venueName', 'city', 'organizer', 'imageUrl', 'startsAt', 'endsAt', 'officialUrl', 'status', 'featured', 'published', 'isDemo'], slugSource: 'title' },
  works: { model: Work, fields: ['title', 'slug', 'subtitle', 'description', 'type', 'categoryId', 'creator', 'imageUrl', 'releasedAt', 'officialUrl', 'featured', 'published', 'isDemo'], slugSource: 'title' },
  artists: { model: Artist, fields: ['name', 'slug', 'bio', 'location', 'disciplines', 'links', 'imageUrl', 'featured', 'published', 'isDemo'], slugSource: 'name' },
  venues: { model: Venue, fields: ['name', 'slug', 'type', 'description', 'address', 'city', 'website', 'publicEmail', 'links', 'imageUrl', 'featured', 'published', 'isDemo'], slugSource: 'name' },
  articles: { model: Article, fields: ['title', 'slug', 'subtitle', 'excerpt', 'body', 'categoryId', 'authorName', 'imageUrl', 'status', 'featured', 'publishedAt', 'isDemo'], slugSource: 'title' },
  collections: { model: Collection, fields: ['title', 'slug', 'description', 'introduction', 'coverImage', 'featured', 'published', 'isDemo'], slugSource: 'title' }
};

const valuesFor = (config, body) => Object.fromEntries(config.fields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field]]));
const validUrlFields = ['officialUrl', 'website'];
const contentModels = { events: Event, works: Work, artists: Artist, venues: Venue, articles: Article, collections: Collection };

function relationInput(body) {
  if (Array.isArray(body.relatedContent)) return body.relatedContent;
  if (typeof body.relatedText !== 'string') return undefined;
  return body.relatedText.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [type, id] = line.split(':');
    return { type, id: Number(id) };
  });
}

async function validateRelations(sourceType, sourceId, input) {
  if (input === undefined) return undefined;
  if (!Array.isArray(input) || input.length > 24) throw Object.assign(new Error('Podes relacionar até 24 itens.'), { status: 400 });
  const normalized = [];
  const seen = new Set();
  for (const item of input) {
    const targetType = item.type || item.targetType;
    const targetId = Number(item.id || item.targetId);
    const model = contentModels[targetType];
    if (!model || !Number.isInteger(targetId) || targetId < 1) throw Object.assign(new Error('Um dos conteúdos relacionados é inválido.'), { status: 400 });
    if (targetType === sourceType && sourceId && targetId === Number(sourceId)) throw Object.assign(new Error('O conteúdo não pode relacionar-se consigo próprio.'), { status: 400 });
    const key = `${targetType}:${targetId}`;
    if (seen.has(key)) continue;
    if (!await model.findByPk(targetId)) throw Object.assign(new Error('Um dos conteúdos relacionados não existe.'), { status: 400 });
    seen.add(key);
    normalized.push({ targetType, targetId, sortOrder: normalized.length });
  }
  return normalized;
}

async function replaceContentRelations(sourceType, sourceId, relations) {
  await ContentRelation.destroy({ where: { sourceType, sourceId } });
  if (relations?.length) await ContentRelation.bulkCreate(relations.map((item) => ({ sourceType, sourceId, ...item })));
}

function validateResource(resource, values) {
  const requiredText = {
    categories: ['name'], events: ['title', 'description', 'city'], works: ['title', 'description', 'type'],
    artists: ['name', 'bio'], venues: ['name', 'type', 'description', 'city'],
    articles: ['title', 'excerpt', 'body'], collections: ['title', 'description']
  }[resource] || [];
  for (const field of requiredText) if (values[field] !== undefined && (typeof values[field] !== 'string' || !values[field].trim())) return `Preenche o campo ${field}.`;
  if (['events', 'works'].includes(resource) && values.categoryId !== undefined && !Number.isInteger(Number(values.categoryId))) return 'Escolhe uma categoria válida.';
  if (resource === 'events') {
    if (values.startsAt !== undefined && Number.isNaN(Date.parse(values.startsAt))) return 'Indica uma data de início válida.';
    if (values.endsAt && values.startsAt && Date.parse(values.endsAt) < Date.parse(values.startsAt)) return 'A data final não pode ser anterior ao início.';
    if (values.status && !['upcoming', 'past', 'cancelled'].includes(values.status)) return 'Estado de evento inválido.';
  }
  if (resource === 'articles' && values.status && !['draft', 'published'].includes(values.status)) return 'Estado editorial inválido.';
  for (const field of validUrlFields) if (values[field] && !isHttpUrl(values[field])) return 'Usa um endereço web que comece por http:// ou https://.';
  for (const field of ['imageUrl', 'coverImage']) if (values[field] && !isSafeAssetRef(values[field])) return 'A imagem deve usar um endereço http(s) ou um caminho local seguro.';
  if (values.links !== undefined) {
    if (!values.links || typeof values.links !== 'object' || Array.isArray(values.links) || Object.keys(values.links).length > 12) return 'As ligações devem ser um objeto JSON válido.';
    if (Object.entries(values.links).some(([label, url]) => typeof label !== 'string' || label.length > 40 || !isHttpUrl(url))) return 'Cada ligação deve ter um nome e um URL http(s) válido.';
  }
  if (values.disciplines !== undefined && (!Array.isArray(values.disciplines) || values.disciplines.length > 20 || values.disciplines.some((item) => typeof item !== 'string' || item.length > 60))) return 'A lista de disciplinas é inválida.';
  return '';
}

const dashboard = async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [events, works, artists, venues, articles, collections, pendingSubmissions, subscribers, clients, admins, newUsers, newMessages, saved, drafts] = await Promise.all([
      Event.count(), Work.count(), Artist.count(), Venue.count(), Article.count(), Collection.count(),
      Submission.count({ where: { status: 'pending' } }), NewsletterSubscriber.count({ where: { unsubscribedAt: null } }),
      User.count({ where: { role: 'cliente' } }), User.count({ where: { role: 'admin' } }),
      User.count({ where: { createdAt: { [Op.gte]: weekAgo } } }), ContactMessage.count({ where: { status: 'new' } }),
      SavedItem.count(), Article.count({ where: { status: 'draft' } })
    ]);
    const [recentActivity, recentSubmissions, recentUsers] = await Promise.all([
      AuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 8 }),
      Submission.findAll({ attributes: ['id', 'title', 'type', 'status', 'createdAt'], order: [['createdAt', 'DESC']], limit: 5 }),
      User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'], order: [['createdAt', 'DESC']], limit: 5 })
    ]);
    return res.json({
      counts: { events, works, artists, venues, articles, collections, pendingSubmissions, subscribers },
      people: { clients, admins, newUsers, newMessages, saved, drafts },
      recentActivity, recentSubmissions, recentUsers
    });
  } catch (error) { return next(error); }
};

const listResources = (resource) => async (req, res, next) => {
  try {
    const config = managed[resource];
    const where = {};
    if (req.query.status && ['articles', 'events'].includes(resource)) where[resource === 'articles' ? 'status' : 'status'] = req.query.status;
    const rows = await config.model.findAll({ where, order: [['updatedAt', 'DESC']], limit: 200 });
    if (resource === 'collections') {
      const entries = await CollectionItem.findAll({ where: { collectionId: rows.map((row) => row.id) }, order: [['sortOrder', 'ASC']] });
      const byCollection = new Map();
      for (const entry of entries) {
        if (!byCollection.has(entry.collectionId)) byCollection.set(entry.collectionId, []);
        byCollection.get(entry.collectionId).push(entry);
      }
      for (const row of rows) row.setDataValue('items', byCollection.get(row.id) || []);
    }
    const relations = await ContentRelation.findAll({ where: { sourceType: resource, sourceId: rows.map((row) => row.id) }, order: [['sortOrder', 'ASC']] });
    const relatedBySource = new Map();
    for (const relation of relations) {
      if (!relatedBySource.has(relation.sourceId)) relatedBySource.set(relation.sourceId, []);
      relatedBySource.get(relation.sourceId).push(relation);
    }
    for (const row of rows) row.setDataValue('relatedContent', relatedBySource.get(row.id) || []);
    return res.json(rows);
  } catch (error) { return next(error); }
};

const createResource = (resource) => async (req, res, next) => {
  try {
    const config = managed[resource];
    const values = valuesFor(config, req.body);
    const related = await validateRelations(resource, null, relationInput(req.body));
    if (values.slug === undefined) values.slug = slugify(values[config.slugSource] || 'conteudo');
    if (resource === 'articles' && values.status === 'published' && !values.publishedAt) values.publishedAt = new Date();
    const validationError = validateResource(resource, values);
    if (validationError) return res.status(400).json({ message: validationError });
    const created = await config.model.create(values);
    if (resource === 'collections' && Array.isArray(req.body.items)) await replaceCollectionItems(created.id, req.body.items);
    if (related !== undefined) await replaceContentRelations(resource, created.id, related);
    await audit(req, 'content.create', { entity: resource, entityId: created.id, details: { title: created.title || created.name } });
    return res.status(201).json(created);
  } catch (error) { return next(error); }
};

const updateResource = (resource) => async (req, res, next) => {
  try {
    const config = managed[resource];
    const record = await config.model.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
    const related = await validateRelations(resource, record.id, relationInput(req.body));
    const values = valuesFor(config, req.body);
    if (Object.hasOwn(req.body, config.slugSource) && !Object.hasOwn(values, 'slug')) values.slug = slugify(values[config.slugSource]);
    if (resource === 'articles' && values.status === 'published' && !record.publishedAt && !values.publishedAt) values.publishedAt = new Date();
    const validationError = validateResource(resource, values);
    if (validationError) return res.status(400).json({ message: validationError });
    await record.update(values);
    if (resource === 'collections' && Array.isArray(req.body.items)) await replaceCollectionItems(record.id, req.body.items);
    if (related !== undefined) await replaceContentRelations(resource, record.id, related);
    await audit(req, 'content.update', { entity: resource, entityId: record.id, details: { fields: Object.keys(values) } });
    return res.json(record);
  } catch (error) { return next(error); }
};

async function replaceCollectionItems(collectionId, items) {
  if (items.length > 100) throw Object.assign(new Error('Uma coleção pode ter até 100 itens.'), { status: 400 });
  const allowed = ['events', 'works', 'artists', 'venues', 'articles', 'collections'];
  const rows = items.map((item, index) => {
    if (!allowed.includes(item.type) || !Number.isInteger(Number(item.id)) || Number(item.id) < 1) throw Object.assign(new Error('Um dos itens da coleção é inválido.'), { status: 400 });
    return { collectionId, contentType: item.type, contentId: Number(item.id), sortOrder: index };
  });
  const lookup = { events: Event, works: Work, artists: Artist, venues: Venue, articles: Article, collections: Collection };
  for (const row of rows) {
    if (row.contentType === 'collections' && Number(row.contentId) === Number(collectionId)) throw Object.assign(new Error('Uma coleção não pode incluir a si própria.'), { status: 400 });
    const target = await lookup[row.contentType].findByPk(row.contentId);
    if (!target) throw Object.assign(new Error('Um dos itens da coleção não existe.'), { status: 400 });
  }
  await sequelize.transaction(async (transaction) => {
    await CollectionItem.destroy({ where: { collectionId }, transaction });
    if (rows.length) await CollectionItem.bulkCreate(rows, { transaction, ignoreDuplicates: true });
  });
}

const deleteResource = (resource) => async (req, res, next) => {
  try {
    const config = managed[resource];
    const record = await config.model.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
    if (resource === 'collections') await CollectionItem.destroy({ where: { collectionId: record.id } });
    await ContentRelation.destroy({ where: { [Op.or]: [{ sourceType: resource, sourceId: record.id }, { targetType: resource, targetId: record.id }] } });
    await record.destroy();
    await audit(req, 'content.delete', { entity: resource, entityId: req.params.id, details: { title: record.title || record.name } });
    return res.status(204).end();
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') return res.status(409).json({ message: 'Este registo está a ser usado por outros conteúdos e não pode ser apagado.' });
    return next(error);
  }
};

const listSubmissions = async (req, res, next) => {
  try {
    const rows = await Submission.findAll({ order: [['createdAt', 'DESC']], limit: 300 });
    const lookup = { events: Event, works: Work, artists: Artist, venues: Venue };
    const results = await Promise.all(rows.map(async (row) => {
      if (row.publishedContentType && lookup[row.publishedContentType]) {
        const content = await lookup[row.publishedContentType].findByPk(row.publishedContentId, { attributes: ['slug'] });
        row.setDataValue('publishedSlug', content?.slug || null);
      }
      return row;
    }));
    return res.json(results);
  } catch (error) { return next(error); }
};

const updateSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Sugestão não encontrada.' });
    const { status, adminNotes } = req.body;
    if (!['pending', 'reviewing', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Estado de moderação inválido.' });
    await submission.update({ status, adminNotes: typeof adminNotes === 'string' ? adminNotes.slice(0, 2000) : submission.adminNotes });
    await audit(req, 'submission.status', { entity: 'submissions', entityId: submission.id, details: { status } });
    return res.json(submission);
  } catch (error) { return next(error); }
};

const publishSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Sugestão não encontrada.' });
    if (submission.publishedContentType && submission.publishedContentId) return res.status(409).json({ message: 'Esta sugestão já originou conteúdo público.' });
    if (!['approved', 'pending', 'reviewing'].includes(submission.status)) return res.status(409).json({ message: 'Esta sugestão foi rejeitada.' });
    const suffix = `sugestao-${submission.id}`;
    const base = slugify(submission.title);
    let content;
    let contentType;
    if (submission.type === 'event') {
      if (!submission.categoryId || !submission.startsAt) return res.status(400).json({ message: 'A sugestão precisa de categoria e data antes de ser publicada.' });
      contentType = 'events';
      content = await Event.create({ title: submission.title, slug: `${base}-${suffix}`, description: submission.description, categoryId: submission.categoryId, city: submission.city || 'A confirmar', venueName: submission.venueName, startsAt: submission.startsAt, officialUrl: submission.officialUrl, published: true, status: new Date(submission.startsAt) >= new Date() ? 'upcoming' : 'past' });
    } else if (submission.type === 'work') {
      if (!submission.categoryId) return res.status(400).json({ message: 'A sugestão precisa de categoria antes de ser publicada.' });
      contentType = 'works';
      content = await Work.create({ title: submission.title, slug: `${base}-${suffix}`, description: submission.description, categoryId: submission.categoryId, type: 'creative-project', officialUrl: submission.officialUrl, published: true });
    } else if (submission.type === 'artist') {
      contentType = 'artists';
      content = await Artist.create({ name: submission.title, slug: `${base}-${suffix}`, bio: submission.description, location: submission.city || null, published: true });
    } else {
      contentType = 'venues';
      content = await Venue.create({ name: submission.title, slug: `${base}-${suffix}`, type: 'Espaço cultural', description: submission.description, city: submission.city || 'A confirmar', website: submission.officialUrl, published: true });
    }
    await submission.update({ status: 'approved', publishedContentType: contentType, publishedContentId: content.id });
    await audit(req, 'submission.publish', { entity: contentType, entityId: content.id, details: { submissionId: submission.id } });
    return res.status(201).json({ contentType, content });
  } catch (error) { return next(error); }
};

const userAttributes = ['id', 'name', 'email', 'role', 'createdAt', 'lastLoginAt', 'lockedUntil', 'failedLoginAttempts'];

const listUsers = async (req, res, next) => {
  try {
    const where = {};
    if (User.ROLES.includes(req.query.role)) where.role = req.query.role;
    const q = String(req.query.q || '').trim().slice(0, 100);
    if (q) where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }, { email: { [Op.iLike]: `%${q}%` } }];
    return res.json(await User.findAll({ attributes: userAttributes, where, order: [['createdAt', 'DESC']], limit: 500 }));
  } catch (error) { return next(error); }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!cleanText(name, 120) || !isEmail(email)) return res.status(400).json({ message: 'Indica um nome e um email válido.' });
    if (!User.ROLES.includes(role)) return res.status(400).json({ message: 'Perfil inválido.' });
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), role, passwordHash: await bcrypt.hash(password, 12) });
    await audit(req, 'user.create', { entity: 'users', entityId: user.id, details: { email: user.email, role } });
    return res.status(201).json(Object.fromEntries(userAttributes.map((key) => [key, user.get(key)])));
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Já existe uma conta com este email.' });
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role, unlock } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    if (unlock) {
      await user.update({ failedLoginAttempts: 0, lockedUntil: null });
      await audit(req, 'user.unlock', { entity: 'users', entityId: user.id });
    }
    if (role !== undefined) {
      if (!User.ROLES.includes(role)) return res.status(400).json({ message: 'Perfil inválido.' });
      if (user.id === req.user.id && role !== 'admin') return res.status(409).json({ message: 'Não podes retirar o perfil de administrador à tua própria conta.' });
      if (user.role === 'admin' && role !== 'admin' && await User.count({ where: { role: 'admin' } }) <= 1) return res.status(409).json({ message: 'É necessário manter pelo menos uma conta administradora.' });
      if (user.role !== role) {
        // Mudar o perfil termina as sessões abertas dessa conta, para o novo nível de acesso entrar logo em vigor.
        await user.update({ role, tokenVersion: user.tokenVersion + 1 });
        await audit(req, 'user.role', { entity: 'users', entityId: user.id, details: { role } });
      }
    }
    return res.json(Object.fromEntries(userAttributes.map((key) => [key, user.get(key)])));
  } catch (error) { return next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    if (user.id === req.user.id) return res.status(409).json({ message: 'Não podes apagar a tua própria conta a partir do backoffice.' });
    if (user.role === 'admin' && await User.count({ where: { role: 'admin' } }) <= 1) return res.status(409).json({ message: 'É necessário manter pelo menos uma conta administradora.' });
    await user.destroy();
    await audit(req, 'user.delete', { entity: 'users', entityId: req.params.id, details: { email: user.email } });
    return res.status(204).end();
  } catch (error) { return next(error); }
};

const listAudit = async (req, res, next) => {
  try {
    const pageSize = 50;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const where = {};
    const action = String(req.query.action || '').trim();
    if (/^[a-z_.]{1,60}$/.test(action)) where.action = { [Op.startsWith]: action };
    const { rows, count } = await AuditLog.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: pageSize, offset: (page - 1) * pageSize });
    return res.json({ rows, total: count, page, pages: Math.max(1, Math.ceil(count / pageSize)) });
  } catch (error) { return next(error); }
};

const listNewsletter = async (req, res, next) => {
  try { return res.json(await NewsletterSubscriber.findAll({ attributes: ['id', 'email', 'consentAt', 'unsubscribedAt'], order: [['createdAt', 'DESC']], limit: 500 })); } catch (error) { return next(error); }
};

const deleteNewsletter = async (req, res, next) => {
  try {
    await NewsletterSubscriber.destroy({ where: { id: req.params.id } });
    await audit(req, 'newsletter.delete', { entity: 'newsletter_subscribers', entityId: req.params.id });
    return res.status(204).end();
  } catch (error) { return next(error); }
};

const listContacts = async (req, res, next) => {
  try { return res.json(await ContactMessage.findAll({ order: [['createdAt', 'DESC']], limit: 500 })); } catch (error) { return next(error); }
};

const updateContact = async (req, res, next) => {
  try {
    const record = await ContactMessage.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Mensagem não encontrada.' });
    if (!['new', 'read', 'closed'].includes(req.body.status)) return res.status(400).json({ message: 'Estado inválido.' });
    await record.update({ status: req.body.status });
    await audit(req, 'contact.status', { entity: 'contact_messages', entityId: record.id, details: { status: req.body.status } });
    return res.json(record);
  } catch (error) { return next(error); }
};

module.exports = {
  dashboard, listResources, createResource, updateResource, deleteResource,
  listSubmissions, updateSubmission, publishSubmission, listUsers, createUser, updateUserRole, deleteUser, listAudit,
  listNewsletter, deleteNewsletter, listContacts, updateContact, managed
};
