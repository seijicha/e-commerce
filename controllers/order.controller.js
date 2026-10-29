const OrderService = require('../services/order.service');
const { getPagination } = require('../utils/pagination');

const OrderController = {
  async index(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 10;
      const { rows: orders, total } = await OrderService.getCustomerOrders(req.session.user.id, {
        page,
        limit
      });
      const pagination = getPagination(total, page, limit);

      res.render('pages/orders/index', {
        title: 'My Orders — GlitchAttire',
        orders,
        pagination,
        layout: 'layouts/main'
      });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const order = await OrderService.getCustomerOrder(req.session.user.id, req.params.id);
      res.render('pages/orders/show', {
        title: `Order #${order.order_number} — GlitchAttire`,
        order,
        layout: 'layouts/main'
      });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req, res, _next) {
    try {
      const order = await OrderService.cancelOrder(req.session.user.id, req.params.id, req);
      req.flash(
        'success',
        `Order #${order.order_number} has been cancelled and inventory restocked.`
      );
      res.redirect(`/orders/${order.id}`);
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/orders/${req.params.id}`);
    }
  }
};

module.exports = OrderController;
