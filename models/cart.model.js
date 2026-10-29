const defaultPool = require('../config/db');

/**
 * Cart data access model (SQL only)
 */
const CartModel = {
  async findByUserId(userId, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT ci.id, ci.user_id, ci.variant_id, ci.quantity,
              pv.size, pv.stock, p.id AS product_id, p.name AS product_name,
              p.slug AS product_slug, p.price, p.image_path, p.is_published,
              (p.price * ci.quantity) AS line_total
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at ASC`,
      [userId]
    );
    return rows;
  },

  async lockCartItemsForUser(userId, conn) {
    const [rows] = await conn.execute(
      `SELECT ci.id, ci.user_id, ci.variant_id, ci.quantity,
              pv.size, pv.stock, p.id AS product_id, p.name AS product_name,
              p.price, p.is_published
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ci.user_id = ?
       FOR UPDATE`,
      [userId]
    );
    return rows;
  },

  async upsertItem(userId, variantId, quantity, conn = defaultPool) {
    await conn.execute(
      `INSERT INTO cart_items (user_id, variant_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = NOW()`,
      [userId, variantId, quantity]
    );
  },

  async updateQuantity(id, userId, quantity, conn = defaultPool) {
    await conn.execute(
      'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [quantity, id, userId]
    );
  },

  async removeItem(id, userId, conn = defaultPool) {
    await conn.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, userId]);
  },

  async clearByUser(userId, conn = defaultPool) {
    await conn.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  },

  async countItems(userId, conn = defaultPool) {
    const [[{ total }]] = await conn.execute(
      'SELECT COALESCE(SUM(quantity), 0) AS total FROM cart_items WHERE user_id = ?',
      [userId]
    );
    return total;
  }
};

module.exports = CartModel;
