const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Event = require('./Event');
const Work = require('./Work');
const Artist = require('./Artist');
const Venue = require('./Venue');
const Article = require('./Article');
const Collection = require('./Collection');
const CollectionItem = require('./CollectionItem');
const ContentRelation = require('./ContentRelation');
const SavedItem = require('./SavedItem');
const Submission = require('./Submission');
const NewsletterSubscriber = require('./NewsletterSubscriber');
const ContactMessage = require('./ContactMessage');
const AuditLog = require('./AuditLog');

Category.hasMany(Event, { foreignKey: 'categoryId', as: 'events' });
Event.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Work, { foreignKey: 'categoryId', as: 'works' });
Work.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Article, { foreignKey: 'categoryId', as: 'articles' });
Article.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Venue.hasMany(Event, { foreignKey: 'venueId', as: 'events' });
Event.belongsTo(Venue, { foreignKey: 'venueId', as: 'venue' });
User.hasMany(SavedItem, { foreignKey: 'userId', as: 'savedItems' });
SavedItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Collection.hasMany(CollectionItem, { foreignKey: 'collectionId', as: 'items', onDelete: 'CASCADE' });
CollectionItem.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize, User, Category, Event, Work, Artist, Venue, Article, Collection,
  CollectionItem, ContentRelation, SavedItem, Submission, NewsletterSubscriber, ContactMessage, AuditLog
};
