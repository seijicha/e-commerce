const CartService = require('../services/cart.service');
const OrderService = require('../services/order.service');
const { calculateShippingFee } = require('../utils/shipping');

const CheckoutController = {
  async index(req, res, next) {
    try {
      const cart = await CartService.getCart(req.session.user.id);
      if (cart.isEmpty) {
        req.flash('error', 'Your shopping cart is empty. Please add products before checking out.');
        return res.redirect('/cart');
      }

      if (cart.hasOutOfStock) {
        req.flash(
          'error',
          'Some items in your cart exceed available stock. Please update your cart.'
        );
        return res.redirect('/cart');
      }

      const defaultFormData = {
        shipping_name: req.session.user.name || '',
        shipping_phone: req.session.user.phone || '',
        shipping_country: 'Philippines',
        shipping_city: 'Manila',
        payment_method: 'cod'
      };
      const initialShipping = calculateShippingFee(
        defaultFormData.shipping_country,
        defaultFormData.shipping_city
      );
      const initialTotal = cart.subtotal + initialShipping.fee;

      res.render('pages/checkout/index', {
        title: 'Checkout — GlitchAttire',
        cart,
        formData: defaultFormData,
        shippingFee: initialShipping.fee,
        shippingLabel: initialShipping.label,
        checkoutTotal: initialTotal,
        errors: {},
        layout: 'layouts/main'
      });
    } catch (err) {
      next(err);
    }
  },

  async processCheckout(req, res, next) {
    try {
      const {
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        shipping_country,
        payment_method
      } = req.body;

      const order = await OrderService.checkout(
        req.session.user.id,
        {
          shippingName: shipping_name,
          shippingPhone: shipping_phone,
          shippingAddress: shipping_address,
          shippingCity: shipping_city,
          shippingPostalCode: shipping_postal_code,
          shippingCountry: shipping_country || 'Philippines',
          paymentMethod: payment_method || 'cod'
        },
        req
      );

      req.flash('success', `Order #${order.order_number} placed successfully!`);
      res.redirect(`/orders/${order.id}`);
    } catch (err) {
      req.flash('error', err.message);
      try {
        const cart = await CartService.getCart(req.session.user.id);
        const currentShipping = calculateShippingFee(
          req.body.shipping_country || 'Philippines',
          req.body.shipping_city || ''
        );
        res.status(err.statusCode || 400).render('pages/checkout/index', {
          title: 'Checkout — GlitchAttire',
          cart,
          formData: req.body,
          shippingFee: currentShipping.fee,
          shippingLabel: currentShipping.label,
          checkoutTotal: cart.subtotal + currentShipping.fee,
          errors: {},
          layout: 'layouts/main'
        });
      } catch (innerErr) {
        next(innerErr);
      }
    }
  }
};

module.exports = CheckoutController;
