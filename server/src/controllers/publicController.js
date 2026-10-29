const { Op } = require('sequelize');
const { Category, Article, Collection, Event, Work, Artist, Venue, ContactMessage } = require('../models');
const catalogue = require('../services/catalogueService');
const { isEmail, cleanText } = require('../middleware/validate');

const listCategories = async (req, res, next) => {
  try { res.json(await Category.findAll({ order: [['sortOrder', 'ASC'], ['name', 'ASC']] })); } catch (error) { next(error); }
};

const home = async (req, res, next) => {
  try {
    const [categories, articles, collections, works, artists, events] = await Promise.all([
      Category.findAll({ order: [['sortOrder', 'ASC'], ['name', 'ASC']] }),
      catalogue.featured('articles', 3), catalogue.featured('collections', 3),
      catalogue.featured('works', 4), catalogue.featured('artists', 4), catalogue.featured('events', 4)
    ]);
    const hero = collections[0] || articles[0] || null;
    res.json({ categories, hero, articles, collections, works, artists, events });
  } catch (error) { next(error); }
};

const contact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!cleanText(name, 120) || !isEmail(email) || !cleanText(subject, 180) || !cleanText(message, 5000)) {
      return res.status(400).json({ message: 'Preenche o nome, um email válido, o assunto e a mensagem.' });
    }
    const record = await ContactMessage.create({ name: name.trim(), email: email.trim().toLowerCase(), subject: subject.trim(), message: message.trim() });
    return res.status(201).json({ id: record.id, message: 'Obrigado. Recebemos a tua mensagem.' });
  } catch (error) { return next(error); }
};

const sitemap = async (req, res, next) => {
  try {
    const [articles, collections, events, works, artists, venues] = await Promise.all([
      Article.findAll({ where: { status: 'published' }, attributes: ['slug', 'updatedAt'] }),
      Collection.findAll({ where: { published: true }, attributes: ['slug', 'updatedAt'] }),
      Event.findAll({ where: { published: true, status: { [Op.ne]: 'cancelled' } }, attributes: ['slug', 'updatedAt'] }),
      Work.findAll({ where: { published: true }, attributes: ['slug', 'updatedAt'] }),
      Artist.findAll({ where: { published: true }, attributes: ['slug', 'updatedAt'] }),
      Venue.findAll({ where: { published: true }, attributes: ['slug', 'updatedAt'] })
    ]);
    const base = (process.env.PUBLIC_URL || (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]).replace(/\/$/, '');
    const staticPaths = ['/', '/discover', '/discover/events', '/discover/works', '/discover/artists', '/discover/venues', '/magazine', '/collections', '/about'];
    const entries = staticPaths.map((path) => `<url><loc>${base}${path}</loc></url>`);
    const groups = [['articles', articles, '/magazine/'], ['collections', collections, '/collections/'], ['events', events, '/events/'], ['works', works, '/works/'], ['artists', artists, '/artists/'], ['venues', venues, '/venues/']];
    for (const [, rows, prefix] of groups) for (const row of rows) entries.push(`<url><loc>${base}${prefix}${encodeURIComponent(row.slug)}</loc><lastmod>${new Date(row.updatedAt).toISOString()}</lastmod></url>`);
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`);
  } catch (error) { next(error); }
};

module.exports = { listCategories, home, contact, sitemap };
