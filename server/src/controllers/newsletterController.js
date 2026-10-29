const crypto = require('crypto');
const { NewsletterSubscriber } = require('../models');
const { isEmail } = require('../middleware/validate');

const subscribe = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!isEmail(email) || req.body.consent !== true) return res.status(400).json({ message: 'Indica um email válido e confirma o consentimento.' });
    const token = crypto.randomBytes(24).toString('hex');
    const existing = await NewsletterSubscriber.findOne({ where: { email } });
    if (existing && !existing.unsubscribedAt) return res.status(200).json({ message: 'Este email já está inscrito.' });
    if (existing) {
      await existing.update({ consent: true, consentAt: new Date(), unsubscribeToken: token, unsubscribedAt: null });
    } else {
      await NewsletterSubscriber.create({ email, consent: true, consentAt: new Date(), unsubscribeToken: token });
    }
    const result = { message: 'Inscrição registada. Ainda não enviamos newsletters automaticamente.' };
    if (process.env.NODE_ENV !== 'production') result.developmentUnsubscribeUrl = `${process.env.PUBLIC_URL || (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]}/unsubscribe?token=${token}`;
    return res.status(201).json(result);
  } catch (error) { return next(error); }
};

const unsubscribe = async (req, res, next) => {
  try {
    const token = String(req.params.token || '').slice(0, 64);
    if (!token) return res.status(400).json({ message: 'O link de cancelamento não é válido.' });
    const subscriber = await NewsletterSubscriber.findOne({ where: { unsubscribeToken: token } });
    if (!subscriber) return res.status(404).json({ message: 'Não encontrámos esta inscrição.' });
    await subscriber.update({ unsubscribedAt: new Date(), consent: false });
    return res.json({ message: 'A inscrição foi cancelada.' });
  } catch (error) { return next(error); }
};

module.exports = { subscribe, unsubscribe };
