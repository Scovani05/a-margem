const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { isEmail, cleanText } = require('../middleware/validate');

const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, bio: user.bio || '' });
const issueToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!cleanText(name, 120) || !isEmail(email) || typeof password !== 'string' || password.length < 10 || password.length > 128) {
      return res.status(400).json({ message: 'Indica o teu nome, um email válido e uma palavra-passe com pelo menos 10 caracteres.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role: 'user' });
    return res.status(201).json({ user: safeUser(user), token: issueToken(user) });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Este email já tem uma conta.' });
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || typeof password !== 'string' || password.length > 128) return res.status(400).json({ message: 'Email ou palavra-passe inválidos.' });
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!valid) return res.status(401).json({ message: 'Email ou palavra-passe incorretos.' });
    return res.json({ user: safeUser(user), token: issueToken(user) });
  } catch (error) { return next(error); }
};

const me = (req, res) => res.json({ user: safeUser(req.user) });

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    if (name !== undefined && !cleanText(name, 120)) return res.status(400).json({ message: 'O nome não pode ficar vazio e deve ter até 120 caracteres.' });
    if (bio !== undefined && (typeof bio !== 'string' || bio.length > 1000)) return res.status(400).json({ message: 'A biografia pode ter até 1000 caracteres.' });
    await req.user.update({ ...(name !== undefined ? { name: name.trim() } : {}), ...(bio !== undefined ? { bio: bio.trim() } : {}) });
    return res.json({ user: safeUser(req.user) });
  } catch (error) { return next(error); }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!isEmail(email)) return res.status(400).json({ message: 'Introduz um email válido.' });
    const response = { message: 'Se existir uma conta com esse email, receberás instruções para repor a palavra-passe.' };
    const user = await User.findOne({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      if (process.env.NODE_ENV !== 'production') response.developmentResetUrl = `${process.env.PUBLIC_URL || (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]}/forgot-password?token=${token}`;
    }
    return res.json(response);
  } catch (error) { return next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== 'string' || typeof password !== 'string' || password.length < 10 || password.length > 128) return res.status(400).json({ message: 'A nova palavra-passe deve ter pelo menos 10 caracteres.' });
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { resetTokenHash: hash, resetTokenExpiresAt: { [Op.gt]: new Date() } } });
    if (!user) return res.status(400).json({ message: 'O link de reposição é inválido ou expirou.' });
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await user.save();
    return res.json({ message: 'Palavra-passe atualizada. Já podes iniciar sessão.' });
  } catch (error) { return next(error); }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash))) return res.status(400).json({ message: 'Confirma a eliminação com a tua palavra-passe.' });
    if (user.role === 'admin' && await User.count({ where: { role: 'admin' } }) <= 1) return res.status(409).json({ message: 'Cria outra conta administradora antes de eliminar esta.' });
    await user.destroy();
    return res.json({ message: 'A tua conta foi eliminada.' });
  } catch (error) { return next(error); }
};

module.exports = { register, login, me, updateProfile, requestPasswordReset, resetPassword, deleteAccount };
