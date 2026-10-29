const { DataTypes } = require('sequelize');

const id = () => ({ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false });
const timestamps = () => ({
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});

async function up(qi) {
  await qi.createTable('users', {
    id: id(), name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'user' },
    bio: { type: DataTypes.TEXT }, reset_token_hash: { type: DataTypes.STRING },
    reset_token_expires_at: { type: DataTypes.DATE }, ...timestamps()
  });
  await qi.createTable('categories', {
    id: id(), name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(240), allowNull: false, defaultValue: '' },
    color: { type: DataTypes.STRING(24), allowNull: false, defaultValue: '#d4ec5b' },
    icon: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'sparkles' },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, ...timestamps()
  });
  await qi.createTable('venues', {
    id: id(), name: { type: DataTypes.STRING(180), allowNull: false }, slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    type: { type: DataTypes.STRING(60), allowNull: false }, description: { type: DataTypes.TEXT, allowNull: false },
    address: { type: DataTypes.STRING(240) }, city: { type: DataTypes.STRING(100), allowNull: false },
    website: { type: DataTypes.TEXT }, public_email: { type: DataTypes.STRING(254) },
    links: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }, image_url: { type: DataTypes.TEXT },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...timestamps()
  });
  await qi.createTable('events', {
    id: id(), title: { type: DataTypes.STRING(180), allowNull: false }, slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    subtitle: { type: DataTypes.STRING(240) }, description: { type: DataTypes.TEXT, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'categories', key: 'id' }, onDelete: 'RESTRICT' },
    venue_id: { type: DataTypes.INTEGER, references: { model: 'venues', key: 'id' }, onDelete: 'SET NULL' },
    venue_name: { type: DataTypes.STRING(180) }, city: { type: DataTypes.STRING(100), allowNull: false }, organizer: { type: DataTypes.STRING(180) },
    image_url: { type: DataTypes.TEXT }, starts_at: { type: DataTypes.DATE, allowNull: false }, ends_at: { type: DataTypes.DATE },
    official_url: { type: DataTypes.TEXT }, status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'upcoming' },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...timestamps()
  });
  await qi.createTable('works', {
    id: id(), title: { type: DataTypes.STRING(180), allowNull: false }, slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    subtitle: { type: DataTypes.STRING(240) }, description: { type: DataTypes.TEXT, allowNull: false }, type: { type: DataTypes.STRING(40), allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'categories', key: 'id' }, onDelete: 'RESTRICT' },
    creator: { type: DataTypes.STRING(180) }, image_url: { type: DataTypes.TEXT }, released_at: { type: DataTypes.DATEONLY }, official_url: { type: DataTypes.TEXT },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...timestamps()
  });
  await qi.createTable('artists', {
    id: id(), name: { type: DataTypes.STRING(160), allowNull: false }, slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    bio: { type: DataTypes.TEXT, allowNull: false }, location: { type: DataTypes.STRING(120) },
    disciplines: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
    links: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }, image_url: { type: DataTypes.TEXT },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...timestamps()
  });
  await qi.createTable('articles', {
    id: id(), title: { type: DataTypes.STRING(220), allowNull: false }, slug: { type: DataTypes.STRING(240), allowNull: false, unique: true },
    subtitle: { type: DataTypes.STRING(240) }, excerpt: { type: DataTypes.TEXT, allowNull: false }, body: { type: DataTypes.TEXT, allowNull: false },
    category_id: { type: DataTypes.INTEGER, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
    author_name: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'Redação À Margem' }, image_url: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'draft' }, featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    published_at: { type: DataTypes.DATE }, is_demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...timestamps()
  });
  await qi.createTable('collections', {
    id: id(), title: { type: DataTypes.STRING(180), allowNull: false }, slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: false }, introduction: { type: DataTypes.TEXT }, cover_image: { type: DataTypes.TEXT },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...timestamps()
  });
  await qi.createTable('collection_items', {
    id: id(), collection_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'collections', key: 'id' }, onDelete: 'CASCADE' },
    content_type: { type: DataTypes.STRING(24), allowNull: false }, content_id: { type: DataTypes.INTEGER, allowNull: false },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, ...timestamps()
  });
  await qi.createTable('content_relations', {
    id: id(), source_type: { type: DataTypes.STRING(24), allowNull: false }, source_id: { type: DataTypes.INTEGER, allowNull: false },
    target_type: { type: DataTypes.STRING(24), allowNull: false }, target_id: { type: DataTypes.INTEGER, allowNull: false },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, ...timestamps()
  });
  await qi.createTable('saved_items', {
    id: id(), user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    content_type: { type: DataTypes.STRING(24), allowNull: false }, content_id: { type: DataTypes.INTEGER, allowNull: false }, ...timestamps()
  });
  await qi.createTable('submissions', {
    id: id(), user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    type: { type: DataTypes.STRING(24), allowNull: false }, title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false }, category_id: { type: DataTypes.INTEGER, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
    city: { type: DataTypes.STRING(100) }, venue_name: { type: DataTypes.STRING(180) }, starts_at: { type: DataTypes.DATE }, official_url: { type: DataTypes.TEXT },
    submitter_name: { type: DataTypes.STRING(120), allowNull: false }, submitter_email: { type: DataTypes.STRING(254), allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' }, admin_notes: { type: DataTypes.TEXT },
    published_content_type: { type: DataTypes.STRING(24) }, published_content_id: { type: DataTypes.INTEGER }, ...timestamps()
  });
  await qi.createTable('newsletter_subscribers', {
    id: id(), email: { type: DataTypes.STRING(254), allowNull: false, unique: true }, consent: { type: DataTypes.BOOLEAN, allowNull: false },
    consent_at: { type: DataTypes.DATE, allowNull: false }, unsubscribe_token: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    unsubscribed_at: { type: DataTypes.DATE }, ...timestamps()
  });
  await qi.createTable('contact_messages', {
    id: id(), name: { type: DataTypes.STRING(120), allowNull: false }, email: { type: DataTypes.STRING(254), allowNull: false },
    subject: { type: DataTypes.STRING(180), allowNull: false }, message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'new' }, ...timestamps()
  });

  await qi.addIndex('events', ['starts_at']);
  await qi.addIndex('events', ['city']);
  await qi.addIndex('events', ['published', 'featured']);
  await qi.addIndex('works', ['type']);
  await qi.addIndex('works', ['published', 'featured']);
  await qi.addIndex('artists', ['location']);
  await qi.addIndex('artists', ['published', 'featured']);
  await qi.addIndex('venues', ['city']);
  await qi.addIndex('venues', ['published', 'featured']);
  await qi.addIndex('articles', ['status', 'published_at']);
  await qi.addIndex('collections', ['published', 'featured']);
  await qi.addIndex('collection_items', ['collection_id', 'content_type', 'content_id'], { unique: true });
  await qi.addIndex('content_relations', ['source_type', 'source_id', 'target_type', 'target_id'], { unique: true });
  await qi.addIndex('content_relations', ['target_type', 'target_id']);
  await qi.addIndex('saved_items', ['user_id', 'content_type', 'content_id'], { unique: true });
  await qi.addIndex('submissions', ['status', 'created_at']);
}

async function down(qi) {
  for (const table of ['contact_messages', 'newsletter_subscribers', 'submissions', 'saved_items', 'content_relations', 'collection_items', 'collections', 'articles', 'artists', 'works', 'events', 'venues', 'categories', 'users']) {
    await qi.dropTable(table);
  }
}

module.exports = { up, down };
