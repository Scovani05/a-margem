require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize, User, Category, Event, Work, Artist, Venue, Article, Collection, CollectionItem, ContentRelation
} = require('../models');

const content = require('./content');

async function ensure(model, where, defaults) {
  const [row] = await model.findOrCreate({ where, defaults });
  return row;
}

async function seed() {
  await sequelize.authenticate();

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 10) throw new Error('ADMIN_PASSWORD must contain at least 10 characters.');
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    const [admin] = await User.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL.trim().toLowerCase() },
      defaults: { name: 'Equipa editorial', email: process.env.ADMIN_EMAIL.trim().toLowerCase(), passwordHash, role: 'admin' }
    });
    if (admin.role !== 'admin') await admin.update({ role: 'admin' });
  }

  // Conta opcional com perfil "cliente" para demonstração.
  if (process.env.CLIENT_EMAIL && process.env.CLIENT_PASSWORD) {
    if (process.env.CLIENT_PASSWORD.length < 10) throw new Error('CLIENT_PASSWORD must contain at least 10 characters.');
    await User.findOrCreate({
      where: { email: process.env.CLIENT_EMAIL.trim().toLowerCase() },
      defaults: { name: 'Cliente de demonstração', email: process.env.CLIENT_EMAIL.trim().toLowerCase(), passwordHash: await bcrypt.hash(process.env.CLIENT_PASSWORD, 12), role: 'cliente' }
    });
  }

  const categoryRows = await Promise.all([
    ['Música', 'musica', 'Sons, discos e projetos independentes.', '#d8e87a', 'music-2'],
    ['Cinema', 'cinema', 'Filmes, salas e outras imagens em movimento.', '#f2a18a', 'clapperboard'],
    ['Fotografia', 'fotografia', 'Olhares, séries e práticas fotográficas.', '#c3b4ed', 'camera'],
    ['Artes visuais', 'artes-visuais', 'Exposições, objetos e práticas visuais.', '#82c8bd', 'shapes'],
    ['Literatura', 'literatura', 'Livros, escrita e edição independente.', '#f2cd79', 'book-open'],
    ['Teatro', 'teatro', 'Palco, performance e artes ao vivo.', '#eea47b', 'drama'],
    ['Cultura independente', 'cultura-independente', 'Iniciativas locais e espaços autónomos.', '#a8c2ee', 'sparkles']
  ].map(([name, slug, description, color, icon], sortOrder) => ensure(Category, { slug }, { name, slug, description, color, icon, sortOrder })));
  const categories = Object.fromEntries(categoryRows.map((item) => [item.slug, item]));

  // Catálogo real (ver content.js). findOrCreate pelo slug: pode correr várias vezes sem duplicar.
  const ids = { events: {}, works: {}, artists: {}, venues: {}, articles: {}, collections: {} };
  for (const v of content.venues) ids.venues[v.slug] = (await ensure(Venue, { slug: v.slug }, { ...v, links: {}, published: true, featured: !!v.featured })).id;
  for (const a of content.artists) ids.artists[a.slug] = (await ensure(Artist, { slug: a.slug }, { ...a, links: {}, published: true, featured: !!a.featured })).id;
  for (const w of content.works) {
    const { category, ...data } = w;
    ids.works[w.slug] = (await ensure(Work, { slug: w.slug }, { ...data, categoryId: categories[category].id, published: true, featured: !!w.featured })).id;
  }
  for (const e of content.events) {
    const { category, venue, ...data } = e;
    const place = await Venue.findByPk(ids.venues[venue]);
    ids.events[e.slug] = (await ensure(Event, { slug: e.slug }, { ...data, categoryId: categories[category].id, venueId: place.id, venueName: place.name, status: 'upcoming', published: true, featured: !!e.featured })).id;
  }
  for (const a of content.articles) {
    const { category, ...data } = a;
    ids.articles[a.slug] = (await ensure(Article, { slug: a.slug }, { ...data, categoryId: categories[category].id, authorName: 'Redação À Margem', status: 'published', featured: !!a.featured })).id;
  }
  for (const c of content.collections) {
    const { items, ...data } = c;
    const collection = await ensure(Collection, { slug: c.slug }, { ...data, published: true, featured: !!c.featured });
    ids.collections[c.slug] = collection.id;
    for (const [index, [contentType, slug]] of items.entries()) {
      await ensure(CollectionItem, { collectionId: collection.id, contentType, contentId: ids[contentType][slug] }, { collectionId: collection.id, contentType, contentId: ids[contentType][slug], sortOrder: index });
    }
  }
  for (const [index, [sourceType, sourceSlug, targetType, targetSlug]] of content.relations.entries()) {
    const where = { sourceType, sourceId: ids[sourceType][sourceSlug], targetType, targetId: ids[targetType][targetSlug] };
    await ensure(ContentRelation, where, { ...where, sortOrder: index });
  }

  console.log('Seed complete: categorias, contas opcionais e catálogo real de novembro e dezembro de 2026.');
}

module.exports = seed;

// Executado diretamente (npm run seed): corre e fecha a ligação.
if (require.main === module) {
  seed().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  }).finally(() => sequelize.close());
}
