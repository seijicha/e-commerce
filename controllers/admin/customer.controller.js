const CustomerService = require('../../services/customer.service');
const { getPagination } = require('../../utils/pagination');

const CustomerController = {
  async index(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 20;

      const { rows: customers, total } = await CustomerService.getAllCustomers({
        page,
        limit
      });
      const pagination = getPagination(total, page, limit);

      res.render('admin/customers/index', {
        title: 'Customers Directory — Admin Console',
        customers,
        pagination,
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const customer = await CustomerService.getCustomerDetail(req.params.id);
      res.render('admin/customers/show', {
        title: `${customer.name} — Customer Details`,
        customer,
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async toggleActive(req, res, _next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const customer = await CustomerService.setActiveStatus(
        id,
        is_active === '1' || is_active === 'true' || is_active === true,
        req
      );

      req.flash(
        'success',
        customer.is_active
          ? `Customer account "${customer.name}" activated.`
          : `Customer account "${customer.name}" deactivated.`
      );
      res.redirect(`/admin/customers/${id}`);
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/admin/customers/${req.params.id}`);
    }
  }
};

module.exports = CustomerController;
