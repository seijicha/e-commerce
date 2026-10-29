const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authRateLimiter } = require('../middleware/rate-limit');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { handleValidation } = require('../middleware/validate');

// Customer registration
router.get('/register', AuthController.showRegister);
router.post(
  '/register',
  authRateLimiter,
  registerValidator,
  handleValidation('pages/auth/register', () => ({
    title: 'Create Account — GlitchAttire',
    layout: 'layouts/auth'
  })),
  AuthController.register
);

// Customer login & logout
router.get('/login', AuthController.showLogin);
router.post(
  '/login',
  authRateLimiter,
  loginValidator,
  handleValidation('pages/auth/login', req => ({
    title: 'Customer Login — GlitchAttire',
    layout: 'layouts/auth',
    nextUrl: req.body.next || ''
  })),
  AuthController.login
);
router.post('/logout', AuthController.logout);

// Admin login & logout
router.get('/admin/login', AuthController.showAdminLogin);
router.post(
  '/admin/login',
  authRateLimiter,
  loginValidator,
  handleValidation('admin/auth/login', () => ({
    title: 'Administrator Console Login — GlitchAttire',
    layout: 'layouts/auth'
  })),
  AuthController.adminLogin
);
router.post('/admin/logout', AuthController.adminLogout);

module.exports = router;
