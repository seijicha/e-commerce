const defaultPool = require('../config/db');

/**
 * Product variant data access model (SQL only)
 */
const VariantModel = {
  async findByProductId(productId, conn = defaultPool) {
    const [rows] = await conn.execute(
      'SELECT id, product_id, size, stock FROM product_variants WHERE product_id = ? ORDER BY id ASC',
      [productId]
    );
    return rows;
  },

  async findById(id, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT pv.id, pv.product_id, pv.size, pv.stock, p.name AS product_name,
              p.price, p.is_published, p.image_path, p.slug AS product_slug
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByIdForUpdate(id, conn) {
    const [rows] = await conn.execute(
      `SELECT pv.id, pv.product_id, pv.size, pv.stock, p.name AS product_name,
              p.price, p.is_published, p.slug AS product_slug
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.id = ?
       FOR UPDATE`,
      [id]
    );
    return rows[0] || null;
  },

  async upsert(productId, size, stock, conn = defaultPool) {
    await conn.execute(
      `INSERT INTO product_variants (product_id, size, stock)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE stock = VALUES(stock)`,
      [productId, size, stock]
    );
  },

  async decrementStock(id, quantity, conn) {
    await conn.execute('UPDATE product_variants SET stock = stock - ? WHERE id = ?', [
      quantity,
      id
    ]);
  },

  async incrementStock(id, quantity, conn = defaultPool) {
    await conn.execute('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [
      quantity,
      id
    ]);
  },

  async deleteNotInSizes(productId, sizes, conn = defaultPool) {
    if (!sizes || sizes.length === 0) {
      await conn.execute('DELETE FROM product_variants WHERE product_id = ?', [productId]);
      return;
    }
    const placeholders = sizes.map(() => '?').join(', ');
    await conn.execute(
      `DELETE FROM product_variants WHERE product_id = ? AND size NOT IN (${placeholders})`,
      [productId, ...sizes]
    );
  }
};

module.exports = VariantModel;
