const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const publicController = require('./controllers/publicController');

const app = express();
app.disable('x-powered-by');
// O Render coloca a API atrás de um proxy: necessário para obter o IP real (limitação de pedidos e auditoria).
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));

// Cabeçalhos de segurança HTTP (equivalentes aos do Helmet). A API só devolve JSON.
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
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
// Só o carregamento de imagens aceita pedidos maiores (imagem em base64, até 2,5 MB).
app.use('/api/admin/media', express.json({ limit: '4mb' }));
app.use(express.json({ limit: '300kb' }));
app.use(express.urlencoded({ extended: false, limit: '300kb' }));
// Respostas com dados de conta ou de administração nunca devem ficar em cache.
app.use(['/api/auth', '/api/admin', '/api/saved', '/api/submissions'], (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.get('/robots.txt', (req, res) => {
  const apiPublicUrl = process.env.API_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:4000';
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${apiPublicUrl.replace(/\/$/, '')}/sitemap.xml\n`);
});
app.get('/sitemap.xml', publicController.sitemap);
app.use('/api', routes);

app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));
app.use((error, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') console.error(error);
  let status = error.status || error.statusCode || 500;
  if (error.type === 'entity.parse.failed') { status = 400; error.message = 'O corpo do pedido não é JSON válido.'; }
  if (error.type === 'entity.too.large') { status = 413; error.message = 'O pedido é demasiado grande.'; }
  if (error.message?.startsWith('Origem não permitida')) status = 403;
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
