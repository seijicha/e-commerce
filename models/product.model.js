const defaultPool = require('../config/db');

/**
 * Product data access model (SQL only)
 */
const ProductModel = {
  async findById(id, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price, p.image_path,
              p.is_published, p.created_by, p.created_at, p.updated_at,
              c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findBySlug(slug, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price, p.image_path,
              p.is_published, p.created_by, p.created_at, p.updated_at,
              c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug]
    );
    return rows[0] || null;
  },

  async findPublicCatalog(
    { categorySlug, query, sort = 'newest', page = 1, limit = 12 } = {},
    conn = defaultPool
  ) {
    const conditions = ['p.is_published = 1'];
    const params = [];

    if (categorySlug) {
      conditions.push('c.slug = ?');
      params.push(categorySlug);
    }

    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      conditions.push('(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm);
    }

    let orderBy = 'p.created_at DESC, p.id DESC';
    if (sort === 'oldest') {
      orderBy = 'p.created_at ASC, p.id ASC';
    } else if (sort === 'price_asc') {
      orderBy = 'p.price ASC, p.id DESC';
    } else if (sort === 'price_desc') {
      orderBy = 'p.price DESC, p.id DESC';
    } else if (sort === 'name_asc') {
      orderBy = 'p.name ASC, p.id DESC';
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) AS total
                      FROM products p
                      JOIN categories c ON p.category_id = c.id
                      WHERE ${whereClause}`;
    const [[{ total }]] = await conn.execute(countSql, params);

    const dataSql = `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price, p.image_path,
                            p.created_at, c.name AS category_name, c.slug AS category_slug,
                            COALESCE(SUM(pv.stock), 0) AS total_stock
                     FROM products p
                     JOIN categories c ON p.category_id = c.id
                     LEFT JOIN product_variants pv ON p.id = pv.product_id
                     WHERE ${whereClause}
                     GROUP BY p.id
                     ORDER BY ${orderBy}
                     LIMIT ? OFFSET ?`;

    const [rows] = await conn.execute(dataSql, [...params, limit, offset]);
    return { rows, total };
  },

  async findFeatured(limit = 4, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT p.id, p.name, p.slug, p.price, p.image_path, c.name AS category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.is_published = 1
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  async findAdminList(
    { categoryId, search, isPublished, page = 1, limit = 10 } = {},
    conn = defaultPool
  ) {
    const conditions = ['1=1'];
    const params = [];

    if (categoryId) {
      conditions.push('p.category_id = ?');
      params.push(categoryId);
    }
    if (isPublished !== undefined && isPublished !== '') {
      conditions.push('p.is_published = ?');
      params.push(isPublished ? 1 : 0);
    }
    if (search && search.trim()) {
      conditions.push('(p.name LIKE ? OR p.slug LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) AS total FROM products p WHERE ${whereClause}`;
    const [[{ total }]] = await conn.execute(countSql, params);

    const dataSql = `SELECT p.id, p.category_id, p.name, p.slug, p.price, p.image_path,
                            p.is_published, p.created_at, c.name AS category_name,
                            COALESCE(SUM(pv.stock), 0) AS total_stock
                     FROM products p
                     JOIN categories c ON p.category_id = c.id
                     LEFT JOIN product_variants pv ON p.id = pv.product_id
                     WHERE ${whereClause}
                     GROUP BY p.id
                     ORDER BY p.created_at DESC
                     LIMIT ? OFFSET ?`;

    const [rows] = await conn.execute(dataSql, [...params, limit, offset]);
    return { rows, total };
  },

  async create(
    { categoryId, name, slug, description, price, imagePath, isPublished = 1, createdBy = null },
    conn = defaultPool
  ) {
    const [result] = await conn.execute(
      `INSERT INTO products (category_id, name, slug, description, price, image_path, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [categoryId, name, slug, description, price, imagePath, isPublished ? 1 : 0, createdBy]
    );
    return result.insertId;
  },

  async update(
    id,
    { categoryId, name, slug, description, price, imagePath, isPublished },
    conn = defaultPool
  ) {
    await conn.execute(
      `UPDATE products
       SET category_id = ?, name = ?, slug = ?, description = ?, price = ?,
           image_path = COALESCE(?, image_path), is_published = ?, updated_at = NOW()
       WHERE id = ?`,
      [categoryId, name, slug, description, price, imagePath, isPublished ? 1 : 0, id]
    );
  },

  async setPublishStatus(id, isPublished, conn = defaultPool) {
    await conn.execute('UPDATE products SET is_published = ?, updated_at = NOW() WHERE id = ?', [
      isPublished ? 1 : 0,
      id
    ]);
  },

  async delete(id, conn = defaultPool) {
    await conn.execute('DELETE FROM products WHERE id = ?', [id]);
  }
};

module.exports = ProductModel;
