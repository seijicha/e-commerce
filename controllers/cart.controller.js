const CartService = require('../services/cart.service');

const CartController = {
  async index(req, res, next) {
    try {
      const cart = await CartService.getCart(req.session.user.id);
      res.render('pages/cart/index', {
        title: 'Shopping Cart — GlitchAttire',
        cart,
        layout: 'layouts/main'
      });
    } catch (err) {
      next(err);
    }
  },

  async addItem(req, res, _next) {
    try {
      const { variant_id, quantity } = req.body;
      await CartService.addItem(req.session.user.id, {
        variantId: variant_id,
        quantity: quantity || 1
      });

      req.flash('success', 'Item added to your shopping cart.');
      const redirectUrl = req.header('Referer') || '/cart';
      res.redirect(redirectUrl);
    } catch (err) {
      req.flash('error', err.message);
      const redirectUrl = req.header('Referer') || '/cart';
      res.redirect(redirectUrl);
    }
  },

  async updateItem(req, res, _next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const cart = await CartService.updateItemQuantity(req.session.user.id, id, quantity);

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          cart: {
            subtotal: cart.subtotal,
            total: cart.total,
            totalItems: cart.totalItems,
            items: cart.items.map(i => ({
              id: i.id,
              quantity: i.quantity,
              unitPrice: i.price,
              lineTotal: i.lineTotal
            }))
          }
        });
      }

      req.flash('success', 'Cart updated successfully.');
      res.redirect('/cart');
    } catch (err) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(err.statusCode || 400).json({ success: false, message: err.message });
      }
      req.flash('error', err.message);
      res.redirect('/cart');
    }
  },

  async removeItem(req, res, _next) {
    try {
      const { id } = req.params;
      await CartService.removeItem(req.session.user.id, id);

      req.flash('success', 'Item removed from your cart.');
      res.redirect('/cart');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/cart');
    }
  }
};

module.exports = CartController;
