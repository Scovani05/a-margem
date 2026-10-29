const jwt = require('jsonwebtoken');
const { User } = require('../models');

const requireAuth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ message: 'Inicia sessão para continuar.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id, { attributes: ['id', 'name', 'email', 'role', 'bio'] });
    if (!user) return res.status(401).json({ message: 'A sessão já não é válida.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'A sessão expirou. Inicia sessão novamente.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Esta área é reservada à equipa editorial.' });
  return next();
};

module.exports = { requireAuth, requireAdmin };
