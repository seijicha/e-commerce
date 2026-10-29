const UserModel = require('../models/user.model');
const OrderModel = require('../models/order.model');
const AuditLogger = require('./audit-logger');

const CustomerService = {
  async getAllCustomers(params) {
    return UserModel.findAllCustomers(params);
  },

  async getCustomerDetail(id) {
    const customer = await UserModel.findById(id);
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    const { rows: orders } = await OrderModel.findByUserId(id, { limit: 10 });
    return { ...customer, orders };
  },

  async setActiveStatus(id, isActive, req = null) {
    const customer = await UserModel.findById(id);
    if (!customer) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (customer.role === 'admin' && req?.session?.user?.id === customer.id) {
      const error = new Error('You cannot deactivate your own administrative account.');
      error.statusCode = 400;
      throw error;
    }

    await UserModel.setActiveStatus(id, Boolean(isActive));
    await AuditLogger.log({
      action: isActive ? 'activated' : 'deactivated',
      entity: 'user',
      entityId: id,
      oldValues: { is_active: customer.is_active },
      newValues: { is_active: isActive ? 1 : 0 },
      req
    });

    return UserModel.findById(id);
  }
};

module.exports = CustomerService;
