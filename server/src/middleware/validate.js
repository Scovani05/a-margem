const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmail = (value) => typeof value === 'string' && value.length <= 254 && emailPattern.test(value.trim());
const isHttpUrl = (value) => {
  if (!value) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
};
const isSafeAssetRef = (value) => {
  if (!value) return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return !value.includes('..');
  return isHttpUrl(value);
};
const cleanText = (value, max = 10000) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;

// Política de palavras-passe: 10 a 128 caracteres, com pelo menos uma letra e um número.
const passwordProblem = (password) => {
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) return 'A palavra-passe deve ter entre 10 e 128 caracteres.';
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) return 'A palavra-passe deve incluir pelo menos uma letra e um número.';
  return '';
};

module.exports = { isEmail, isHttpUrl, isSafeAssetRef, cleanText, passwordProblem };
