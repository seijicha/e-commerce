const defaultPool = require('../config/db');
const OrderModel = require('../models/order.model');
const CartModel = require('../models/cart.model');
const VariantModel = require('../models/variant.model');
const AuditLogger = require('./audit-logger');
const { generateOrderNumber } = require('../utils/order-number');
const { calculateShippingFee } = require('../utils/shipping');

const VALID_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

const OrderService = {
  async checkout(userId, shippingData, req = null) {
    const conn = await defaultPool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Lock customer's cart rows and their variant rows with FOR UPDATE
      const cartItems = await CartModel.lockCartItemsForUser(userId, conn);
      if (!cartItems || cartItems.length === 0) {
        const error = new Error('Your cart is empty. Please add items before checking out.');
        error.statusCode = 400;
        throw error;
      }

      // 2. Validate availability and stock
      let calculatedTotal = 0;
      for (const item of cartItems) {
        if (!item.is_published) {
          const error = new Error(`Item "${item.product_name}" is no longer available.`);
          error.statusCode = 400;
          throw error;
        }
        if (item.quantity > item.stock) {
          const error = new Error(
            `Insufficient stock for "${item.product_name}" (size ${item.size}). Requested: ${item.quantity}, available: ${item.stock}.`
          );
          error.statusCode = 400;
          throw error;
        }
        const unitPrice = parseFloat(item.price);
        calculatedTotal += unitPrice * item.quantity;
      }

      const subtotal = calculatedTotal;
      const validMethods = ['cod', 'gcash', 'bank_transfer'];
      const paymentMethod = validMethods.includes(shippingData.paymentMethod)
        ? shippingData.paymentMethod
        : 'cod';
      const shippingCountry = (shippingData.shippingCountry || 'Philippines').trim();
      const shippingCity = (shippingData.shippingCity || '').trim();
      const shippingCalc = calculateShippingFee(shippingCountry, shippingCity);
      const shippingFee = shippingCalc.fee;
      const grandTotal = subtotal + shippingFee;

      // 3. Create order record
      const orderNumber = generateOrderNumber();
      const orderId = await OrderModel.createOrder(
        {
          orderNumber,
          userId,
          status: 'pending',
          paymentMethod,
          subtotal,
          shippingFee,
          total: grandTotal,
          shippingName: shippingData.shippingName.trim(),
          shippingPhone: shippingData.shippingPhone.trim(),
          shippingAddress: shippingData.shippingAddress.trim(),
          shippingCity,
          shippingPostalCode: shippingData.shippingPostalCode.trim(),
          shippingCountry
        },
        conn
      );

      // 4. Create snapshot order items & decrement stock
      for (const item of cartItems) {
        const unitPrice = parseFloat(item.price);
        await OrderModel.createOrderItem(
          {
            orderId,
            productId: item.product_id,
            variantId: item.variant_id,
            productName: item.product_name,
            size: item.size,
            unitPrice,
            quantity: item.quantity
          },
          conn
        );

        await VariantModel.decrementStock(item.variant_id, item.quantity, conn);
      }

      // 5. Clear customer's cart
      await CartModel.clearByUser(userId, conn);

      await conn.commit();

      const createdOrder = await OrderModel.findById(orderId);
      const items = await OrderModel.findItemsByOrderId(orderId);

      await AuditLogger.log({
        userId,
        action: 'checkout',
        entity: 'order',
        entityId: orderId,
        newValues: {
          orderNumber,
          subtotal,
          shippingFee,
          total: grandTotal,
          itemCount: items.length
        },
        req
      });

      return { ...createdOrder, items };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getCustomerOrders(userId, { page = 1, limit = 10 } = {}) {
    return OrderModel.findByUserId(userId, { page, limit });
  },

  async getCustomerOrder(userId, orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order || order.user_id !== parseInt(userId, 10)) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    const items = await OrderModel.findItemsByOrderId(orderId);
    return { ...order, items };
  },

  async cancelOrder(userId, orderId, req = null) {
    const order = await this.getCustomerOrder(userId, orderId);

    if (order.status !== 'pending') {
      const error = new Error('Only pending orders can be cancelled');
      error.statusCode = 400;
      throw error;
    }

    const conn = await defaultPool.getConnection();
    try {
      await conn.beginTransaction();

      await OrderModel.updateStatus(orderId, 'cancelled', conn);

      // Restock items
      const items = await OrderModel.findItemsByOrderId(orderId, conn);
      for (const item of items) {
        if (item.variant_id) {
          await VariantModel.incrementStock(item.variant_id, item.quantity, conn);
        }
      }

      await conn.commit();

      await AuditLogger.log({
        userId,
        action: 'cancel_order',
        entity: 'order',
        entityId: orderId,
        oldValues: { status: order.status },
        newValues: { status: 'cancelled' },
        req
      });

      return this.getCustomerOrder(userId, orderId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getAdminOrders(params) {
    return OrderModel.findAllAdmin(params);
  },

  async getAdminOrderById(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    const items = await OrderModel.findItemsByOrderId(orderId);
    return { ...order, items };
  },

  async updateOrderStatus(orderId, newStatus, req = null) {
    const order = await this.getAdminOrderById(orderId);

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      const error = new Error(
        `Cannot change order status from '${order.status}' to '${newStatus}'. Allowed: ${allowed.join(', ') || 'none'}.`
      );
      error.statusCode = 400;
      throw error;
    }

    const conn = await defaultPool.getConnection();
    try {
      await conn.beginTransaction();

      await OrderModel.updateStatus(orderId, newStatus, conn);

      // Restock if transitioning to cancelled
      if (newStatus === 'cancelled') {
        const items = await OrderModel.findItemsByOrderId(orderId, conn);
        for (const item of items) {
          if (item.variant_id) {
            await VariantModel.incrementStock(item.variant_id, item.quantity, conn);
          }
        }
      }

      await conn.commit();

      await AuditLogger.log({
        action: 'update_status',
        entity: 'order',
        entityId: orderId,
        oldValues: { status: order.status },
        newValues: { status: newStatus },
        req
      });

      return this.getAdminOrderById(orderId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
};

module.exports = OrderService;
