const defaultPool = require('../config/db');
const OrderModel = require('../models/order.model');

const DashboardService = {
  async getOverviewStats() {
    const conn = defaultPool;

    // 1. Total products & low-stock variant count
    const [[{ totalProducts }]] = await conn.execute(
      'SELECT COUNT(*) AS totalProducts FROM products'
    );
    const [lowStockVariants] = await conn.execute(
      `SELECT pv.id, pv.product_id, pv.size, pv.stock, p.name AS product_name, p.slug AS product_slug
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.stock <= 10
       ORDER BY pv.stock ASC
       LIMIT 10`
    );

    // 2. Orders by status
    const statusCounts = await OrderModel.countByStatus(conn);
    const ordersByStatus = {
      pending: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    for (const item of statusCounts) {
      if (ordersByStatus[item.status] !== undefined) {
        ordersByStatus[item.status] = item.count;
      }
    }

    // 3. Revenue total
    const revenue = await OrderModel.getRevenueTotals(conn);

    // 4. Recent orders
    const { rows: recentOrders } = await OrderModel.findAllAdmin({ limit: 5 }, conn);

    return {
      totalProducts,
      lowStockVariants,
      lowStockCount: lowStockVariants.length,
      ordersByStatus,
      totalRevenue: parseFloat(revenue) || 0,
      recentOrders
    };
  }
};

module.exports = DashboardService;
