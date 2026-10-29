const express = require('express');
const router = express.Router();

const publicRoutes = require('./public.routes');
const authRoutes = require('./auth.routes');
const customerRoutes = require('./customer.routes');
const adminRoutes = require('./admin/index');

// Public catalog and home
router.use('/', publicRoutes);

// Authentication (customer & admin login/register)
router.use('/', authRoutes);

// Customer shopping cart, checkout, orders, account
router.use('/', customerRoutes);

// Admin console
router.use('/admin', adminRoutes);

module.exports = router;
