const crypto = require('crypto');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

// Contagem de visitantes sem cookies de terceiros nem dados pessoais.
// O navegador envia um identificador aleatório (guardado no próprio navegador);
// aqui só se guarda um hash dele, uma vez por dia, com o número de páginas vistas.
const VISITOR_ID = /^[A-Za-z0-9-]{16,64}$/;
const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|monitor/i;
const TODAY = "(NOW() AT TIME ZONE 'Europe/Lisbon')::date";

const hashVisitor = (visitorId) => crypto
  .createHmac('sha256', process.env.JWT_SECRET || 'a-margem-visits')
  .update(visitorId)
  .digest('hex');

const record = async (req, res, next) => {
  try {
    const { visitorId, path } = req.body || {};
    if (typeof visitorId !== 'string' || !VISITOR_ID.test(visitorId)) return res.status(400).json({ message: 'Identificador inválido.' });
    if (BOTS.test(req.get('user-agent') || '')) return res.status(204).end();
    const cleanPath = typeof path === 'string' && path.startsWith('/') ? path.slice(0, 300) : null;
    if (cleanPath && cleanPath.startsWith('/admin')) return res.status(204).end();
    await sequelize.query(
      `INSERT INTO site_visits (visitor_hash, day, first_path, page_views, created_at, updated_at)
       VALUES (:hash, ${TODAY}, :path, 1, NOW(), NOW())
       ON CONFLICT (visitor_hash, day) DO UPDATE SET page_views = site_visits.page_views + 1, updated_at = NOW()`,
      { replacements: { hash: hashVisitor(visitorId), path: cleanPath } }
    );
    return res.status(204).end();
  } catch (error) { return next(error); }
};

// Visitantes únicos: total, últimos 30 dias e últimos 7 dias (o dia de hoje incluído).
async function visitorStats() {
  const [row] = await sequelize.query(
    `SELECT COUNT(DISTINCT visitor_hash)::int AS total,
            COUNT(DISTINCT visitor_hash) FILTER (WHERE day > ${TODAY} - 30)::int AS "month",
            COUNT(DISTINCT visitor_hash) FILTER (WHERE day > ${TODAY} - 7)::int AS "week",
            COALESCE(SUM(page_views) FILTER (WHERE day > ${TODAY} - 30), 0)::int AS "monthPageViews"
       FROM site_visits`,
    { type: QueryTypes.SELECT }
  );
  return row;
}

module.exports = { record, visitorStats, hashVisitor };
