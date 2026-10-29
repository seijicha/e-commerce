const OrderService = require('../../services/order.service');
const { getPagination } = require('../../utils/pagination');

const AdminOrderController = {
  async index(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 15;
      const { status, search } = req.query;

      const { rows: orders, total } = await OrderService.getAdminOrders({
        status,
        search,
        page,
        limit
      });
      const pagination = getPagination(total, page, limit);

      res.render('admin/orders/index', {
        title: 'Manage Orders — Admin Console',
        orders,
        pagination,
        activeStatus: status || '',
        searchQuery: search || '',
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const order = await OrderService.getAdminOrderById(req.params.id);
      res.render('admin/orders/show', {
        title: `Order #${order.order_number} — Admin Console`,
        order,
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, _next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await OrderService.updateOrderStatus(id, status, req);

      req.flash('success', `Order #${order.order_number} status updated to "${status}".`);
      res.redirect(`/admin/orders/${id}`);
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/admin/orders/${req.params.id}`);
    }
  }
};

module.exports = AdminOrderController;
