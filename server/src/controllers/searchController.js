const { Op, fn, col, where: sqlWhere } = require('sequelize');
const { Category, Event, Work, Artist, Venue, Article, Collection } = require('../models');

const groups = [
  { type: 'events', model: Event, title: 'title', fields: ['title', 'subtitle', 'description', 'city', 'venueName', 'organizer', 'body'], where: () => ({ published: true, status: 'upcoming', [Op.or]: [{ startsAt: { [Op.gte]: new Date() } }, { endsAt: { [Op.gte]: new Date() } }] }) },
  { type: 'works', model: Work, title: 'title', fields: ['title', 'subtitle', 'description', 'creator', 'body'], where: () => ({ published: true }) },
  { type: 'artists', model: Artist, title: 'name', fields: ['name', 'bio', 'location', 'body'], where: () => ({ published: true }) },
  { type: 'venues', model: Venue, title: 'name', fields: ['name', 'description', 'city', 'type', 'address', 'body'], where: () => ({ published: true }) },
  { type: 'articles', model: Article, title: 'title', fields: ['title', 'subtitle', 'excerpt', 'body', 'authorName'], where: () => ({ status: 'published' }) },
  { type: 'collections', model: Collection, title: 'title', fields: ['title', 'description', 'introduction'], where: () => ({ published: true }) }
];

// Divide a pesquisa em palavras (máx. 6) e escapa os caracteres especiais do LIKE.
const termsOf = (raw) => String(raw || '').trim().slice(0, 120).split(/\s+/).filter((word) => word.length > 1).slice(0, 6)
  .map((word) => word.replace(/[\\%_]/g, '\\$&'));

// Cada palavra tem de aparecer em pelo menos um campo; acentos e maiúsculas são ignorados
// (unaccent + ILIKE), por isso "musica" encontra "Música".
function matchAll(model, fields, terms) {
  return {
    [Op.and]: terms.map((term) => ({
      [Op.or]: fields.map((field) => sqlWhere(fn('unaccent', col(`${model.name}.${model.rawAttributes[field].field}`)), { [Op.iLike]: fn('unaccent', `%${term}%`) }))
    }))
  };
}

// Primeiro os resultados cujo título contém a pesquisa; depois a ordem normal.
const rank = (group, q) => (a, b) => {
  const hit = (row) => String(row[group.title] || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .includes(q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')) ? 0 : 1;
  return hit(a) - hit(b);
};

const categoryInclude = (type) => (['events', 'works', 'articles'].includes(type)
  ? [{ model: Category, as: 'category', attributes: ['name', 'slug', 'color'], required: false }]
  : []);

const search = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 120);
    const terms = termsOf(q);
    const type = groups.some((group) => group.type === req.query.type) ? req.query.type : null;
    if (!terms.length) return res.json({ q, groups: [], counts: {}, total: 0 });
    // Contagens por tipo (para os filtros) e resultados do tipo escolhido (ou de todos).
    const counted = await Promise.all(groups.map(async (group) => {
      const where = { ...group.where(), ...matchAll(group.model, group.fields, terms) };
      const count = await group.model.count({ where });
      if (type && group.type !== type) return { type: group.type, count, results: [] };
      const rows = await group.model.findAll({
        where, include: categoryInclude(group.type), limit: type ? 48 : 8,
        order: group.type === 'events' ? [['startsAt', 'ASC']] : [['createdAt', 'DESC']]
      });
      return { type: group.type, count, results: rows.sort(rank(group, q)) };
    }));
    const counts = Object.fromEntries(counted.map((group) => [group.type, group.count]));
    const total = counted.reduce((sum, group) => sum + group.count, 0);
    res.json({ q, type, counts, total, groups: counted.filter((group) => !type || group.type === type).map(({ type: t, results, count }) => ({ type: t, results, count })) });
  } catch (error) { next(error); }
};

// Sugestões rápidas para a barra de pesquisa (até 8, só os campos necessários).
const suggest = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 120);
    const terms = termsOf(q);
    if (!terms.length) return res.json({ q, results: [] });
    const lists = await Promise.all(groups.map(async (group) => {
      const rows = await group.model.findAll({
        where: { ...group.where(), ...matchAll(group.model, [group.title, ...group.fields.slice(1, 3)], terms) },
        attributes: ['id', 'slug', group.title, ...(group.type === 'events' ? ['startsAt', 'city'] : []), ...(group.type === 'venues' ? ['city'] : [])],
        limit: 4, order: group.type === 'events' ? [['startsAt', 'ASC']] : [['createdAt', 'DESC']]
      });
      return rows.sort(rank(group, q)).map((row) => ({ type: group.type, id: row.id, slug: row.slug, title: row[group.title], startsAt: row.startsAt || null, city: row.city || null }));
    }));
    res.json({ q, results: lists.flat().slice(0, 8) });
  } catch (error) { next(error); }
};

module.exports = { search, suggest };
