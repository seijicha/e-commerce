const CartModel = require('../models/cart.model');
const VariantModel = require('../models/variant.model');

const CartService = {
  async getCart(userId) {
    const items = await CartModel.findByUserId(userId);

    let subtotal = 0;
    let totalItems = 0;
    let hasOutOfStock = false;

    const formattedItems = items.map(item => {
      const price = parseFloat(item.price);
      const lineTotal = price * item.quantity;
      const isOutOfStock = item.quantity > item.stock || !item.is_published;

      if (isOutOfStock) {
        hasOutOfStock = true;
      }

      subtotal += lineTotal;
      totalItems += item.quantity;

      return {
        ...item,
        price,
        lineTotal,
        isOutOfStock
      };
    });

    return {
      items: formattedItems,
      subtotal,
      total: subtotal,
      totalItems,
      hasOutOfStock,
      isEmpty: formattedItems.length === 0
    };
  },

  async addItem(userId, { variantId, quantity = 1 }) {
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      const error = new Error('Quantity must be at least 1');
      error.statusCode = 400;
      throw error;
    }

    const variant = await VariantModel.findById(variantId);
    if (!variant || !variant.is_published) {
      const error = new Error('Selected item is currently unavailable');
      error.statusCode = 404;
      throw error;
    }

    // Check existing quantity in cart
    const existingItems = await CartModel.findByUserId(userId);
    const currentInCart = existingItems.find(i => i.variant_id === parseInt(variantId, 10));
    const totalRequested = (currentInCart?.quantity || 0) + qty;

    if (totalRequested > variant.stock) {
      const available = Math.max(0, variant.stock - (currentInCart?.quantity || 0));
      const error = new Error(
        available > 0
          ? `Only ${available} more item(s) available in size ${variant.size} (stock: ${variant.stock})`
          : `Size ${variant.size} has reached available inventory stock (${variant.stock})`
      );
      error.statusCode = 400;
      throw error;
    }

    await CartModel.upsertItem(userId, variantId, qty);
    return this.getCart(userId);
  },

  async updateItemQuantity(userId, itemId, quantity) {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      return this.removeItem(userId, itemId);
    }

    const items = await CartModel.findByUserId(userId);
    const item = items.find(i => i.id === parseInt(itemId, 10));
    if (!item) {
      const error = new Error('Cart item not found');
      error.statusCode = 404;
      throw error;
    }

    if (qty > item.stock) {
      const error = new Error(
        `Cannot exceed available stock of ${item.stock} for size ${item.size}`
      );
      error.statusCode = 400;
      throw error;
    }

    await CartModel.updateQuantity(itemId, userId, qty);
    return this.getCart(userId);
  },

  async removeItem(userId, itemId) {
    await CartModel.removeItem(itemId, userId);
    return this.getCart(userId);
  },

  async getItemCount(userId) {
    return CartModel.countItems(userId);
  }
};

module.exports = CartService;
