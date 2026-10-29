const AuditLogModel = require('../models/audit-log.model');

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'token',
  '_csrf',
  'csrfToken'
]);

function sanitizeValues(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeValues);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      clean[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      clean[key] = sanitizeValues(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const AuditLogger = {
  async log(
    {
      userId = null,
      action,
      entity,
      entityId = null,
      oldValues = null,
      newValues = null,
      req = null
    },
    conn
  ) {
    try {
      const ipAddress = req
        ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || null
        : null;
      const userAgent = req ? req.headers['user-agent']?.substring(0, 255) || null : null;
      const effectiveUserId = userId || (req?.session?.user?.id ?? null);

      await AuditLogModel.create(
        {
          userId: effectiveUserId,
          action,
          entity,
          entityId,
          oldValues: sanitizeValues(oldValues),
          newValues: sanitizeValues(newValues),
          ipAddress,
          userAgent
        },
        conn
      );
    } catch (err) {
      console.error('[AuditLogger] Failed to write audit record:', err.message);
    }
  }
};

module.exports = AuditLogger;
