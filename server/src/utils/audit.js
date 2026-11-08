const { AuditLog } = require('../models');

// Regista ações relevantes (logins, alterações no backoffice, base de dados).
// Nunca falha o pedido principal: erros de auditoria só são escritos na consola.
async function audit(req, action, { entity = null, entityId = null, details = {}, user = req.user } = {}) {
  try {
    await AuditLog.create({
      userId: user?.id || null,
      userEmail: user?.email || details.email || null,
      action,
      entity,
      entityId: entityId === null || entityId === undefined ? null : String(entityId),
      details,
      ip: (req.ip || '').slice(0, 64)
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') console.error('Audit log failed:', error.message);
  }
}

module.exports = audit;
