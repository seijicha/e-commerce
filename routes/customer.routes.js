const express = require('express');
const router = express.Router();
const { requireCustomer } = require('../middleware/auth');
const CartController = require('../controllers/cart.controller');
const CheckoutController = require('../controllers/checkout.controller');
const OrderController = require('../controllers/order.controller');
const AccountController = require('../controllers/account.controller');
const { addToCartValidator, updateCartValidator } = require('../validators/cart.validator');
const { checkoutValidator } = require('../validators/checkout.validator');
const { handleValidation } = require('../middleware/validate');

router.use(['/cart', '/checkout', '/orders', '/account'], requireCustomer);

// Shopping cart
router.get('/cart', CartController.index);
router.post('/cart/items', addToCartValidator, handleValidation(), CartController.addItem);
router.patch('/cart/items/:id', updateCartValidator, handleValidation(), CartController.updateItem);
router.delete('/cart/items/:id', CartController.removeItem);

// Checkout
router.get('/checkout', CheckoutController.index);
router.post(
  '/checkout',
  checkoutValidator,
  handleValidation('pages/checkout/index'),
  CheckoutController.processCheckout
);

// Orders
router.get('/orders', OrderController.index);
router.get('/orders/:id', OrderController.show);
router.post('/orders/:id/cancel', OrderController.cancel);

// Account Profile
router.get('/account', AccountController.index);
router.put('/account', AccountController.update);

module.exports = router;
