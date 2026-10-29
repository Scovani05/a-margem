const { Op } = require('sequelize');
const { Category, Event, Work, Artist, Venue, Article, Collection } = require('../models');

const groups = [
  { type: 'events', model: Event, fields: ['title', 'subtitle', 'description', 'city'], where: { published: true, status: 'upcoming', startsAt: { [Op.gte]: new Date() } } },
  { type: 'works', model: Work, fields: ['title', 'subtitle', 'description', 'creator', 'type'], where: { published: true } },
  { type: 'artists', model: Artist, fields: ['name', 'bio', 'location'], where: { published: true } },
  { type: 'venues', model: Venue, fields: ['name', 'description', 'city', 'type'], where: { published: true } },
  { type: 'articles', model: Article, fields: ['title', 'subtitle', 'excerpt', 'body'], where: { status: 'published' } },
  { type: 'collections', model: Collection, fields: ['title', 'description', 'introduction'], where: { published: true } }
];

const search = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 120);
    const type = groups.some((group) => group.type === req.query.type) ? req.query.type : null;
    if (!q) return res.json({ q, groups: [], total: 0 });
    const selected = type ? groups.filter((group) => group.type === type) : groups;
    const results = await Promise.all(selected.map(async (group) => {
      const rows = await group.model.findAll({
        where: { ...group.where, [Op.or]: group.fields.map((field) => ({ [field]: { [Op.iLike]: `%${q}%` } })) },
        include: ['events', 'works', 'articles'].includes(group.type)
          ? [{ model: Category, as: 'category', attributes: ['name', 'slug', 'color'], required: false }]
          : [],
        limit: 8,
        order: group.type === 'events' ? [['startsAt', 'ASC']] : [['createdAt', 'DESC']]
      });
      return { type: group.type, results: rows };
    }));
    res.json({ q, groups: results, total: results.reduce((sum, group) => sum + group.results.length, 0) });
  } catch (error) { next(error); }
};

module.exports = { search };
