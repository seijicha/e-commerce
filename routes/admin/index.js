const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const DashboardController = require('../../controllers/admin/dashboard.controller');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const orderRoutes = require('./order.routes');
const customerRoutes = require('./customer.routes');

// Apply requireAdmin to the entire admin group
router.use(requireAdmin);

// Admin dashboard
router.get('/', DashboardController.index);

// Sub-modules
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);

module.exports = router;
