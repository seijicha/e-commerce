const env = require('../config/env');

function notFoundHandler(req, res) {
  res.status(404).render('pages/errors/404', {
    title: '404 — Page Not Found',
    path: req.originalUrl,
    currentPath: req.originalUrl || req.path || '',
    user: req.session?.user || null,
    csrfToken: res.locals?.csrfToken || '',
    layout: 'layouts/main'
  });
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode === 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  const errorView = statusCode === 403 ? 'pages/errors/403' : 'pages/errors/500';

  res.status(statusCode).render(errorView, {
    title: `${statusCode} — Error`,
    message: err.message || 'An unexpected error occurred.',
    stack: env.NODE_ENV === 'development' ? err.stack : null,
    currentPath: req.originalUrl || req.path || '',
    user: req.session?.user || null,
    csrfToken: res.locals?.csrfToken || '',
    layout: 'layouts/main'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
