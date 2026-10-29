const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { sessionMiddleware } = require('./config/session');
const { attachUser } = require('./middleware/auth');
const { doubleCsrfProtection, attachCsrfToken, handleCsrfError } = require('./middleware/csrf');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');
const { formatMoney } = require('./utils/money');
const CartService = require('./services/cart.service');
const routes = require('./routes');

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null
      }
    }
  })
);

// 2. View Engine & Layouts Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Default template locals fallback to prevent ReferenceErrors during error handling
app.locals.currentPath = '';
app.locals.user = null;
app.locals.csrfToken = '';
app.locals.cartCount = 0;
app.locals.currency = env.CURRENCY || 'USD';
app.locals.formatMoney = formatMoney;

// 3. Early Synchronous Locals Initialization
app.use((req, res, next) => {
  res.locals.currentPath = req.path || '/';
  res.locals.activeCategory = req.query.category || null;
  res.locals.user = null;
  res.locals.csrfToken = '';
  res.locals.cartCount = 0;
  res.locals.currency = env.CURRENCY || 'USD';
  res.locals.formatMoney = formatMoney;
  res.locals.flash = { success: [], error: [], info: [] };
  next();
});

// 4. Static Assets
express.static.mime.define({ 'image/avif': ['avif'] });
app.use(express.static(path.join(__dirname, 'public')));

// 5. Body & Cookie Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(env.SESSION_SECRET));

// 5. Method Override (supports ?_method= and hidden _method fields)
app.use(
  methodOverride(req => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
    if (req.query && '_method' in req.query) {
      return req.query._method;
    }
  })
);

// 6. Session & Flash
app.use(sessionMiddleware);
app.use(flash());
app.use(attachUser);

// 7. CSRF Protection (except for multipart uploads which validate CSRF in their route chain)
app.use((req, res, next) => {
  const isMultipart = req.headers['content-type']?.startsWith('multipart/form-data');
  if (isMultipart) {
    return next();
  }
  doubleCsrfProtection(req, res, next);
});
app.use(attachCsrfToken);
app.use(handleCsrfError);

// 8. Global Template Locals
app.use(async (req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.currency = env.CURRENCY;
  res.locals.formatMoney = formatMoney;
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info')
  };

  // Provide live cart count badge for customer session
  if (req.session?.user?.role === 'customer') {
    try {
      res.locals.cartCount = await CartService.getItemCount(req.session.user.id);
    } catch {
      res.locals.cartCount = 0;
    }
  } else {
    res.locals.cartCount = 0;
  }

  next();
});

// 9. Mount Application Routes
app.use(routes);

// 10. Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
