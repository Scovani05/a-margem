const { Submission } = require('../models');
const { isEmail, isHttpUrl, cleanText } = require('../middleware/validate');

const create = async (req, res, next) => {
  try {
    const { type, title, description, categoryId, city, venueName, startsAt, officialUrl, submitterName, submitterEmail } = req.body;
    if (!['event', 'work', 'artist', 'venue'].includes(type) || !cleanText(title, 180) || !cleanText(description, 5000) ||
      !cleanText(submitterName, 120) || !isEmail(submitterEmail) || !isHttpUrl(officialUrl)) {
      return res.status(400).json({ message: 'Verifica os campos obrigatórios e o formato do endereço web.' });
    }
    if (type === 'event' && (!startsAt || Number.isNaN(Date.parse(startsAt)))) return res.status(400).json({ message: 'Indica a data de início do evento.' });
    if (['event', 'work'].includes(type) && (!categoryId || !Number.isInteger(Number(categoryId)) || Number(categoryId) < 1)) return res.status(400).json({ message: 'Escolhe uma categoria.' });
    const record = await Submission.create({
      type, title: title.trim(), description: description.trim(), categoryId: categoryId ? Number(categoryId) : null,
      city: city?.trim() || null, venueName: venueName?.trim() || null,
      startsAt: startsAt ? new Date(startsAt) : null, officialUrl: officialUrl?.trim() || null,
      submitterName: submitterName.trim(), submitterEmail: submitterEmail.trim().toLowerCase(), userId: req.user?.id || null
    });
    return res.status(201).json({ id: record.id, message: 'Sugestão recebida. A equipa editorial vai revê-la antes de a publicar.' });
  } catch (error) { return next(error); }
};

const mine = async (req, res, next) => {
  try {
    const rows = await Submission.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'type', 'title', 'status', 'city', 'startsAt', 'publishedContentType', 'createdAt'],
      order: [['createdAt', 'DESC']], limit: 100
    });
    return res.json(rows);
  } catch (error) { return next(error); }
};

module.exports = { create, mine };
