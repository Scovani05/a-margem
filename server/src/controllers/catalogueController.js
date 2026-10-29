const catalogue = require('../services/catalogueService');

const list = (resource) => async (req, res, next) => {
  try { res.json(await catalogue.list(resource, req.query)); } catch (error) { next(error); }
};

const detail = (resource) => async (req, res, next) => {
  try {
    const record = await catalogue.detail(resource, req.params.slug);
    if (!record) return res.status(404).json({ message: 'Não encontrámos este conteúdo.' });
    return res.json(record);
  } catch (error) { return next(error); }
};

module.exports = { list, detail };
