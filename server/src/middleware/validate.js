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

module.exports = { isEmail, isHttpUrl, isSafeAssetRef, cleanText };
