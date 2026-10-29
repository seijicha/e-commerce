const defaultPool = require('../config/db');

/**
 * Category data access model (SQL only)
 */
const CategoryModel = {
  async findAll(conn = defaultPool) {
    const [rows] = await conn.execute(
      'SELECT id, name, slug, created_at FROM categories ORDER BY name ASC'
    );
    return rows;
  },

  async findById(id, conn = defaultPool) {
    const [rows] = await conn.execute(
      'SELECT id, name, slug, created_at FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findBySlug(slug, conn = defaultPool) {
    const [rows] = await conn.execute(
      'SELECT id, name, slug, created_at FROM categories WHERE slug = ?',
      [slug]
    );
    return rows[0] || null;
  },

  async create({ name, slug }, conn = defaultPool) {
    const [result] = await conn.execute('INSERT INTO categories (name, slug) VALUES (?, ?)', [
      name,
      slug
    ]);
    return result.insertId;
  },

  async update(id, { name, slug }, conn = defaultPool) {
    await conn.execute('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);
  },

  async delete(id, conn = defaultPool) {
    await conn.execute('DELETE FROM categories WHERE id = ?', [id]);
  },

  async countProducts(id, conn = defaultPool) {
    const [[{ total }]] = await conn.execute(
      'SELECT COUNT(*) AS total FROM products WHERE category_id = ?',
      [id]
    );
    return total;
  }
};

module.exports = CategoryModel;
