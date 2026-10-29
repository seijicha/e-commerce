const defaultPool = require('../config/db');

/**
 * Audit log data access model (SQL only)
 */
const AuditLogModel = {
  async create(
    {
      userId = null,
      action,
      entity,
      entityId = null,
      oldValues = null,
      newValues = null,
      ipAddress = null,
      userAgent = null
    },
    conn = defaultPool
  ) {
    const [result] = await conn.execute(
      `INSERT INTO audit_logs
        (user_id, action, entity, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entity,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      ]
    );
    return result.insertId;
  },

  async findRecent(limit = 20, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT al.*, u.name AS user_name, u.email AS user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
};

module.exports = AuditLogModel;
