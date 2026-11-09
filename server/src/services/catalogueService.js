const { Op, fn, col } = require('sequelize');
const { Category, Event, Work, Artist, Venue, Article, Collection, CollectionItem, ContentRelation } = require('../models');

const resources = {
  events: { model: Event, fields: ['title', 'subtitle', 'description', 'city', 'venueName'], category: true, date: 'startsAt' },
  works: { model: Work, fields: ['title', 'subtitle', 'description', 'creator', 'type'], category: true },
  artists: { model: Artist, fields: ['name', 'bio', 'location'] },
  venues: { model: Venue, fields: ['name', 'description', 'city', 'type'] },
  articles: { model: Article, fields: ['title', 'subtitle', 'excerpt', 'body', 'authorName'], category: true, article: true },
  collections: { model: Collection, fields: ['title', 'description', 'introduction'] }
};

const publicWhere = (type) => type === 'articles' ? { status: 'published' } : { published: true };

function includesFor(type) {
  if (type === 'events') return [
    { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'] },
    { model: Venue, as: 'venue', attributes: ['id', 'name', 'slug', 'city', 'imageUrl'], required: false }
  ];
  if (type === 'works') return [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'] }];
  if (type === 'articles') return [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'], required: false }];
  return [];
}

async function list(resource, params = {}) {
  const config = resources[resource];
  if (!config) throw Object.assign(new Error('Tipo de conteúdo inválido.'), { status: 400 });
  const page = Math.max(1, Math.min(100000, Number.parseInt(params.page, 10) || 1));
  const limit = Math.max(1, Math.min(36, Number.parseInt(params.limit, 10) || 12));
  const where = { ...publicWhere(resource) };
  const q = String(params.q || params.search || '').trim().slice(0, 120);
  if (q) where[Op.or] = config.fields.map((field) => ({ [field]: { [Op.iLike]: `%${q}%` } }));

  if (config.category && params.category) {
    const category = await Category.findOne({ where: { [Op.or]: [{ slug: params.category }, { name: { [Op.iLike]: params.category } }] } });
    if (!category) return { rows: [], total: 0, page, limit, pages: 0 };
    where.categoryId = category.id;
  }
  if (params.city && ['events', 'artists', 'venues'].includes(resource)) {
    const field = resource === 'artists' ? 'location' : 'city';
    where[field] = { [Op.iLike]: `%${String(params.city).slice(0, 100)}%` };
  }
  if (resource === 'works' && params.type) where.type = String(params.type).slice(0, 40);
  if (resource === 'events') {
    // Em breve ou a decorrer: ainda não começou, ou já começou mas ainda não terminou (ex.: exposições).
    const upcomingOrOngoing = () => ({ [Op.or]: [{ startsAt: { [Op.gte]: new Date() } }, { endsAt: { [Op.gte]: new Date() } }] });
    if ((params.from && Number.isNaN(Date.parse(params.from))) || (params.to && Number.isNaN(Date.parse(params.to)))) throw Object.assign(new Error('A data indicada não é válida.'), { status: 400 });
    if (params.from && params.to && Date.parse(params.from) > Date.parse(params.to)) throw Object.assign(new Error('A data inicial tem de ser anterior à data final.'), { status: 400 });
    if (params.from && !Number.isNaN(Date.parse(params.from))) where.startsAt = { ...(where.startsAt || {}), [Op.gte]: new Date(params.from) };
    if (params.to && !Number.isNaN(Date.parse(params.to))) where.startsAt = { ...(where.startsAt || {}), [Op.lte]: new Date(params.to) };
    if (params.status && ['upcoming', 'cancelled', 'past'].includes(params.status)) {
      if (params.status === 'cancelled') where.status = 'cancelled';
      else if (params.status === 'past') {
        // Passados: já começaram e já terminaram (ou não têm data de fim).
        where.status = { [Op.ne]: 'cancelled' };
        where.startsAt = { ...(where.startsAt || {}), [Op.lt]: new Date() };
        where[Op.and] = [...(where[Op.and] || []), { [Op.or]: [{ endsAt: null }, { endsAt: { [Op.lt]: new Date() } }] }];
      }
      else { where.status = 'upcoming'; where[Op.and] = [...(where[Op.and] || []), upcomingOrOngoing()]; }
    } else {
      where.status = 'upcoming';
      where[Op.and] = [...(where[Op.and] || []), upcomingOrOngoing()];
    }
  }
  let order = [['createdAt', 'DESC']];
  if (resource === 'events') order = [['featured', 'DESC'], ['startsAt', 'ASC']];
  if (params.sort === 'title') order = [[['artists', 'venues'].includes(resource) ? 'name' : 'title', 'ASC']];
  if (params.sort === 'newest') order = [['createdAt', 'DESC']];
  if (params.sort === 'featured') order = [['featured', 'DESC'], ['createdAt', 'DESC']];
  const { rows, count } = await config.model.findAndCountAll({
    where, include: includesFor(resource), order, limit, offset: (page - 1) * limit,
    distinct: true
  });
  if (resource === 'collections' && rows.length) {
    const counts = await CollectionItem.findAll({
      attributes: ['collectionId', [fn('COUNT', col('id')), 'itemCount']],
      where: { collectionId: rows.map((row) => row.id) }, group: ['collectionId'], raw: true
    });
    const byId = new Map(counts.map((item) => [Number(item.collectionId), Number(item.itemCount)]));
    for (const row of rows) row.setDataValue('itemsCount', byId.get(row.id) || 0);
  }
  return { rows, total: count, page, limit, pages: Math.ceil(count / limit) };
}

async function detail(resource, slug) {
  const config = resources[resource];
  if (!config) throw Object.assign(new Error('Tipo de conteúdo inválido.'), { status: 400 });
  const record = await config.model.findOne({ where: { slug, ...publicWhere(resource) }, include: includesFor(resource) });
  if (!record) return null;
  if (resource === 'artists') {
    const [works, events] = await Promise.all([
      Work.findAll({ where: { published: true, creator: { [Op.iLike]: record.name } }, include: includesFor('works'), limit: 8 }),
      Event.findAll({ where: { published: true, status: 'upcoming', organizer: { [Op.iLike]: record.name }, [Op.or]: [{ startsAt: { [Op.gte]: new Date() } }, { endsAt: { [Op.gte]: new Date() } }] }, include: includesFor('events'), limit: 8 })
    ]);
    record.setDataValue('works', works);
    record.setDataValue('events', events);
  }
  if (resource === 'venues') {
    const events = await Event.findAll({
      where: { published: true, status: 'upcoming', venueId: record.id, [Op.or]: [{ startsAt: { [Op.gte]: new Date() } }, { endsAt: { [Op.gte]: new Date() } }] },
      include: includesFor('events'), order: [['startsAt', 'ASC']], limit: 8
    });
    record.setDataValue('events', events);
  }
  if (resource === 'works' && record.creator) {
    const artist = await require('../models').Artist.findOne({ where: { published: true, name: { [Op.iLike]: record.creator } } });
    record.setDataValue('artists', artist ? [artist] : []);
  }
  if (resource === 'collections') {
    const collectionItems = await CollectionItem.findAll({ where: { collectionId: record.id }, order: [['sortOrder', 'ASC']] });
    const models = { events: Event, works: Work, artists: Artist, venues: Venue, articles: Article, collections: Collection };
    const items = await Promise.all(collectionItems.map(async (entry) => {
      const model = models[entry.contentType];
      if (!model) return null;
      const where = entry.contentType === 'articles'
        ? { id: entry.contentId, status: 'published' }
        : { id: entry.contentId, published: true };
      const item = await model.findOne({ where });
      return item ? { type: entry.contentType, ...item.toJSON() } : null;
    }));
    record.setDataValue('items', items.filter(Boolean));
  }
  const relationRows = await ContentRelation.findAll({
    where: { sourceType: resource, sourceId: record.id }, order: [['sortOrder', 'ASC']], limit: 24
  });
  const models = { events: Event, works: Work, artists: Artist, venues: Venue, articles: Article, collections: Collection };
  const relatedContent = await Promise.all(relationRows.map(async (relation) => {
    const model = models[relation.targetType];
    if (!model) return null;
    const target = await model.findOne({
      where: { id: relation.targetId, ...publicWhere(relation.targetType) },
      include: includesFor(relation.targetType)
    });
    return target ? { type: relation.targetType, ...target.toJSON() } : null;
  }));
  record.setDataValue('relatedContent', relatedContent.filter(Boolean));
  return record;
}

async function featured(resource, limit = 4) {
  const config = resources[resource];
  if (!config) return [];
  const where = { ...publicWhere(resource), featured: true };
  if (resource === 'events') { where.status = 'upcoming'; where[Op.or] = [{ startsAt: { [Op.gte]: new Date() } }, { endsAt: { [Op.gte]: new Date() } }]; }
  const rows = await config.model.findAll({
    where,
    include: includesFor(resource),
    order: resource === 'events' ? [['startsAt', 'ASC']] : [['createdAt', 'DESC']],
    limit
  });
  if (resource === 'collections' && rows.length) {
    const counts = await CollectionItem.findAll({
      attributes: ['collectionId', [fn('COUNT', col('id')), 'itemCount']],
      where: { collectionId: rows.map((row) => row.id) }, group: ['collectionId'], raw: true
    });
    const byId = new Map(counts.map((item) => [Number(item.collectionId), Number(item.itemCount)]));
    for (const row of rows) row.setDataValue('itemsCount', byId.get(row.id) || 0);
  }
  return rows;
}

module.exports = { resources, publicWhere, list, detail, featured };
