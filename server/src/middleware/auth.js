const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_OPTIONS = { algorithms: ['HS256'], issuer: 'a-margem-api', audience: 'a-margem-client' };

const bearer = (req) => ((req.headers.authorization || '').startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

// Lê e valida o token. A versão do token ("v") tem de coincidir com a da conta:
// ao mudar a palavra-passe ou terminar todas as sessões, os tokens antigos deixam de servir.
async function userFromToken(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET, JWT_OPTIONS);
  const user = await User.findByPk(payload.sub, { attributes: ['id', 'name', 'email', 'role', 'bio', 'tokenVersion', 'lastLoginAt', 'createdAt'] });
  if (!user || user.tokenVersion !== payload.v) return null;
  return user;
}

const requireAuth = async (req, res, next) => {
  try {
    const token = bearer(req);
    if (!token) return res.status(401).json({ message: 'Inicia sessão para continuar.' });
    const user = await userFromToken(token);
    if (!user) return res.status(401).json({ message: 'A sessão já não é válida. Inicia sessão novamente.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'A sessão expirou. Inicia sessão novamente.' });
  }
};

// Para rotas públicas que aproveitam a sessão quando existe (ex.: sugestões).
const optionalAuth = async (req, res, next) => {
  const token = bearer(req);
  if (!token) return next();
  try { req.user = (await userFromToken(token)) || undefined; } catch { req.user = undefined; }
  return next();
};

const requireRole = (...roles) => {
  const middleware = (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ message: 'Não tens permissão para aceder a esta área.' });
    return next();
  };
  return middleware;
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Esta área é reservada a administradores.' });
  return next();
};

const issueToken = (user) => jwt.sign({ sub: user.id, role: user.role, v: user.tokenVersion }, process.env.JWT_SECRET, {
  algorithm: 'HS256', issuer: JWT_OPTIONS.issuer, audience: JWT_OPTIONS.audience, expiresIn: process.env.JWT_EXPIRES_IN || '8h'
});

module.exports = { requireAuth, optionalAuth, requireAdmin, requireRole, issueToken };
