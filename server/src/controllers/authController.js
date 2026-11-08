const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const { issueToken } = require('../middleware/auth');
const { isEmail, cleanText, passwordProblem } = require('../middleware/validate');
const audit = require('../utils/audit');

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
// Hash usado quando o email não existe, para a resposta demorar o mesmo tempo (evita enumeração de contas).
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12);

const safeUser = (user) => ({
  id: user.id, name: user.name, email: user.email, role: user.role, bio: user.bio || '',
  lastLoginAt: user.lastLoginAt || null, createdAt: user.createdAt
});
const session = (user) => ({ user: safeUser(user), token: issueToken(user) });

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!cleanText(name, 120) || !isEmail(email)) return res.status(400).json({ message: 'Indica o teu nome e um email válido.' });
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });
    const passwordHash = await bcrypt.hash(password, 12);
    // O registo público cria sempre perfis "cliente". Só um admin pode promover contas.
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role: 'cliente', lastLoginAt: new Date() });
    await audit(req, 'auth.register', { entity: 'users', entityId: user.id, user });
    return res.status(201).json(session(user));
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Este email já tem uma conta.' });
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || typeof password !== 'string' || password.length > 128) return res.status(400).json({ message: 'Email ou palavra-passe inválidos.' });
    const normalized = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalized } });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Conta bloqueada temporariamente por excesso de tentativas. Tenta novamente dentro de ${minutes} min.` });
    }

    const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
    if (!user || !valid) {
      if (user) {
        const attempts = user.failedLoginAttempts + 1;
        await user.update({ failedLoginAttempts: attempts, lockedUntil: attempts >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MINUTES * 60000) : null });
      }
      await audit(req, 'auth.login_failed', { entity: 'users', entityId: user?.id, user: null, details: { email: normalized } });
      return res.status(401).json({ message: 'Email ou palavra-passe incorretos.' });
    }

    await user.update({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() });
    await audit(req, 'auth.login', { entity: 'users', entityId: user.id, user, details: { role: user.role } });
    return res.json(session(user));
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

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(400).json({ message: 'A palavra-passe atual está incorreta.' });
    const problem = passwordProblem(newPassword);
    if (problem) return res.status(400).json({ message: problem });
    if (currentPassword === newPassword) return res.status(400).json({ message: 'A nova palavra-passe tem de ser diferente da atual.' });
    // Incrementar a versão invalida todas as sessões abertas noutros dispositivos.
    await user.update({ passwordHash: await bcrypt.hash(newPassword, 12), tokenVersion: user.tokenVersion + 1 });
    await audit(req, 'auth.password_changed', { entity: 'users', entityId: user.id });
    return res.json({ message: 'Palavra-passe atualizada. As outras sessões foram terminadas.', ...session(user) });
  } catch (error) { return next(error); }
};

const logoutAll = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    await user.update({ tokenVersion: user.tokenVersion + 1 });
    await audit(req, 'auth.logout_all', { entity: 'users', entityId: user.id });
    return res.json({ message: 'Todas as sessões foram terminadas.' });
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
      // Sem serviço de email configurado: o link só é devolvido fora de produção.
      if (process.env.NODE_ENV !== 'production') response.developmentResetUrl = `${process.env.PUBLIC_URL || (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]}/forgot-password?token=${token}`;
    }
    return res.json(response);
  } catch (error) { return next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== 'string' || token.length !== 64) return res.status(400).json({ message: 'O link de reposição é inválido ou expirou.' });
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { resetTokenHash: hash, resetTokenExpiresAt: { [Op.gt]: new Date() } } });
    if (!user) return res.status(400).json({ message: 'O link de reposição é inválido ou expirou.' });
    await user.update({
      passwordHash: await bcrypt.hash(password, 12), resetTokenHash: null, resetTokenExpiresAt: null,
      tokenVersion: user.tokenVersion + 1, failedLoginAttempts: 0, lockedUntil: null
    });
    await audit(req, 'auth.password_reset', { entity: 'users', entityId: user.id, user });
    return res.json({ message: 'Palavra-passe atualizada. Já podes iniciar sessão.' });
  } catch (error) { return next(error); }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash))) return res.status(400).json({ message: 'Confirma a eliminação com a tua palavra-passe.' });
    if (user.role === 'admin' && await User.count({ where: { role: 'admin' } }) <= 1) return res.status(409).json({ message: 'Cria outra conta administradora antes de eliminar esta.' });
    await audit(req, 'auth.account_deleted', { entity: 'users', entityId: user.id });
    await user.destroy();
    return res.json({ message: 'A tua conta foi eliminada.' });
  } catch (error) { return next(error); }
};

module.exports = { register, login, me, updateProfile, changePassword, logoutAll, requestPasswordReset, resetPassword, deleteAccount, safeUser };
