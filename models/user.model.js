const defaultPool = require('../config/db');

/**
 * User data access model (SQL only)
 */
const UserModel = {
  async findById(id, conn = defaultPool) {
    const [rows] = await conn.execute(
      'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email, conn = defaultPool) {
    const [rows] = await conn.execute(
      'SELECT id, name, email, password_hash, role, phone, is_active, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, role = 'customer', phone = null }, conn = defaultPool) {
    const [result] = await conn.execute(
      'INSERT INTO users (name, email, password_hash, role, phone, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [name, email, passwordHash, role, phone]
    );
    return result.insertId;
  },

  async updateProfile(id, { name, phone }, conn = defaultPool) {
    await conn.execute('UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?', [
      name,
      phone,
      id
    ]);
  },

  async updatePassword(id, passwordHash, conn = defaultPool) {
    await conn.execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [
      passwordHash,
      id
    ]);
  },

  async setActiveStatus(id, isActive, conn = defaultPool) {
    await conn.execute('UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?', [
      isActive ? 1 : 0,
      id
    ]);
  },

  async findAllCustomers({ page = 1, limit = 20 } = {}, conn = defaultPool) {
    const offset = (page - 1) * limit;
    const [rows] = await conn.execute(
      'SELECT id, name, email, phone, is_active, created_at FROM users WHERE role = "customer" ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await conn.execute(
      'SELECT COUNT(*) AS total FROM users WHERE role = "customer"'
    );
    return { rows, total };
  }
};

module.exports = UserModel;
