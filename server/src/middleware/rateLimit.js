const buckets = new Map();
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of buckets) if (value.until < now) buckets.delete(key);
}, 60000);
cleanup.unref?.();

function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, message = 'Demasiados pedidos. Tenta novamente mais tarde.' } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const entry = buckets.get(key);
    if (!entry || entry.until <= now) buckets.set(key, { count: 1, until: now + windowMs });
    else if (entry.count >= max) return res.status(429).json({ message });
    else entry.count += 1;
    return next();
  };
}

module.exports = rateLimit;
