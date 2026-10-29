const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const publicController = require('./controllers/publicController');

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pela política CORS.'));
  },
  credentials: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/robots.txt', (req, res) => {
  const apiPublicUrl = process.env.API_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:4000';
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${apiPublicUrl.replace(/\/$/, '')}/sitemap.xml\n`);
});
app.get('/sitemap.xml', publicController.sitemap);
app.use('/api', routes);

app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));
app.use((error, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') console.error(error);
  let status = error.status || 500;
  let message = status >= 500 ? 'Ocorreu um erro interno. Tenta novamente mais tarde.' : error.message;
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
    status = 400;
    message = 'Os dados enviados não são válidos.';
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'Já existe um registo com estes dados.';
  }
  res.status(status).json({ message: message || 'Ocorreu um erro interno.' });
});

module.exports = app;
