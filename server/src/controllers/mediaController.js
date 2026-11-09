const { Media } = require('../models');
const audit = require('../utils/audit');

const MAX_BYTES = 2.5 * 1024 * 1024;
// Só imagens raster. SVG fica de fora porque pode conter JavaScript.
const SIGNATURES = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/gif': (b) => b.subarray(0, 4).toString('ascii') === 'GIF8',
  'image/webp': (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP'
};

const publicUrl = (req, id) => `${(process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')}/api/media/${id}`;

// POST /api/admin/media - recebe { name, data } com a imagem em base64 (Data URL ou base64 simples).
const upload = async (req, res, next) => {
  try {
    const name = String(req.body?.name || 'imagem').slice(0, 200);
    const raw = String(req.body?.data || '').replace(/^data:[^;]+;base64,/, '');
    if (!raw || !/^[A-Za-z0-9+/=\s]+$/.test(raw)) return res.status(400).json({ message: 'Ficheiro inválido.' });
    const buffer = Buffer.from(raw, 'base64');
    if (!buffer.length) return res.status(400).json({ message: 'O ficheiro está vazio.' });
    if (buffer.length > MAX_BYTES) return res.status(413).json({ message: 'A imagem pode ter no máximo 2,5 MB.' });
    // O tipo é decidido pelo conteúdo real do ficheiro, não pelo nome nem pelo que o browser diz.
    const mimeType = Object.keys(SIGNATURES).find((type) => SIGNATURES[type](buffer));
    if (!mimeType) return res.status(415).json({ message: 'Formato não suportado. Usa JPG, PNG, WebP ou GIF.' });
    const media = await Media.create({ originalName: name, mimeType, sizeBytes: buffer.length, data: buffer, uploadedBy: req.user.id });
    await audit(req, 'media.upload', { entity: 'media', entityId: media.id, details: { name, mimeType, size: buffer.length } });
    return res.status(201).json({ id: media.id, url: publicUrl(req, media.id), mimeType, sizeBytes: buffer.length });
  } catch (error) { return next(error); }
};

// GET /api/media/:id - público, para as imagens aparecerem no site.
const show = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) return res.status(404).json({ message: 'Imagem não encontrada.' });
    const media = await Media.findByPk(id);
    if (!media) return res.status(404).json({ message: 'Imagem não encontrada.' });
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Length', media.sizeBytes);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', 'inline');
    return res.end(media.data);
  } catch (error) { return next(error); }
};

module.exports = { upload, show, MAX_BYTES };
