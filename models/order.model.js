const defaultPool = require('../config/db');

/**
 * Order and order items data access model (SQL only)
 */
const OrderModel = {
  async createOrder(
    {
      orderNumber,
      userId,
      status = 'pending',
      paymentMethod = 'cod',
      subtotal = 0,
      shippingFee = 0,
      total,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry = 'Philippines'
    },
    conn = defaultPool
  ) {
    const [result] = await conn.execute(
      `INSERT INTO orders
        (order_number, user_id, status, payment_method, subtotal, shipping_fee, total,
         shipping_name, shipping_phone, shipping_address, shipping_city, shipping_postal_code, shipping_country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        status,
        paymentMethod,
        subtotal,
        shippingFee,
        total,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingPostalCode,
        shippingCountry
      ]
    );
    return result.insertId;
  },

  async createOrderItem(
    { orderId, productId, variantId, productName, size, unitPrice, quantity },
    conn = defaultPool
  ) {
    const [result] = await conn.execute(
      `INSERT INTO order_items
        (order_id, product_id, variant_id, product_name, size, unit_price, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, productId, variantId, productName, size, unitPrice, quantity]
    );
    return result.insertId;
  },

  async findById(id, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByOrderNumber(orderNumber, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.order_number = ?`,
      [orderNumber]
    );
    return rows[0] || null;
  },

  async findItemsByOrderId(orderId, conn = defaultPool) {
    const [rows] = await conn.execute(
      `SELECT oi.*, p.slug AS product_slug, p.image_path
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?
       ORDER BY oi.id ASC`,
      [orderId]
    );
    return rows;
  },

  async findByUserId(userId, { page = 1, limit = 10 } = {}, conn = defaultPool) {
    const offset = (page - 1) * limit;
    const [rows] = await conn.execute(
      `SELECT o.*, COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    const [[{ total }]] = await conn.execute(
      'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?',
      [userId]
    );
    return { rows, total };
  },

  async findAllAdmin({ status, search, page = 1, limit = 15 } = {}, conn = defaultPool) {
    const conditions = ['1=1'];
    const params = [];

    if (status && status.trim()) {
      conditions.push('o.status = ?');
      params.push(status.trim());
    }

    if (search && search.trim()) {
      conditions.push('(o.order_number LIKE ? OR o.shipping_name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) AS total
                      FROM orders o
                      LEFT JOIN users u ON o.user_id = u.id
                      WHERE ${whereClause}`;
    const [[{ total }]] = await conn.execute(countSql, params);

    const dataSql = `SELECT o.*, u.name AS user_name, u.email AS user_email,
                            COUNT(oi.id) AS item_count
                     FROM orders o
                     LEFT JOIN users u ON o.user_id = u.id
                     LEFT JOIN order_items oi ON o.id = oi.order_id
                     WHERE ${whereClause}
                     GROUP BY o.id
                     ORDER BY o.created_at DESC
                     LIMIT ? OFFSET ?`;

    const [rows] = await conn.execute(dataSql, [...params, limit, offset]);
    return { rows, total };
  },

  async updateStatus(id, status, conn = defaultPool) {
    await conn.execute('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [
      status,
      id
    ]);
  },

  async countByStatus(conn = defaultPool) {
    const [rows] = await conn.execute(
      'SELECT status, COUNT(*) AS count FROM orders GROUP BY status'
    );
    return rows;
  },

  async getRevenueTotals(conn = defaultPool) {
    const [[{ totalRevenue }]] = await conn.execute(
      'SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders WHERE status IN ("paid", "shipped", "delivered")'
    );
    return totalRevenue;
  }
};

module.exports = OrderModel;
