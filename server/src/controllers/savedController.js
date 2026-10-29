const { Op } = require('sequelize');
const { SavedItem, Event, Work, Artist, Venue, Article, Collection, Category } = require('../models');

const contentModels = {
  events: { model: Event, where: { published: true, status: { [Op.ne]: 'cancelled' } } },
  works: { model: Work, where: { published: true } },
  artists: { model: Artist, where: { published: true } },
  venues: { model: Venue, where: { published: true } },
  articles: { model: Article, where: { status: 'published' } },
  collections: { model: Collection, where: { published: true } }
};

const list = async (req, res, next) => {
  try {
    const saves = await SavedItem.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    const items = await Promise.all(saves.map(async (save) => {
      const config = contentModels[save.contentType];
      if (!config) return null;
      const item = await config.model.findOne({ where: { ...config.where, id: save.contentId }, include: ['events', 'works', 'articles'].includes(save.contentType)
        ? [{ model: Category, as: 'category', attributes: ['name', 'slug', 'color'], required: false }]
        : [] });
      return item ? { saveId: save.id, type: save.contentType, content: item } : null;
    }));
    return res.json(items.filter(Boolean));
  } catch (error) { return next(error); }
};

const create = async (req, res, next) => {
  try {
    const type = String(req.body.type || '');
    const id = Number.parseInt(req.body.id, 10);
    const config = contentModels[type];
    if (!config || !Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Escolhe um conteúdo válido para guardar.' });
    const target = await config.model.findOne({ where: { ...config.where, id } });
    if (!target) return res.status(404).json({ message: 'Este conteúdo já não está disponível.' });
    const [item] = await SavedItem.findOrCreate({ where: { userId: req.user.id, contentType: type, contentId: id } });
    return res.status(201).json({ saved: true, id: item.id });
  } catch (error) { return next(error); }
};

const remove = async (req, res, next) => {
  try {
    await SavedItem.destroy({ where: { userId: req.user.id, contentType: req.params.type, contentId: Number(req.params.id) } });
    return res.status(204).end();
  } catch (error) { return next(error); }
};

module.exports = { list, create, remove };
