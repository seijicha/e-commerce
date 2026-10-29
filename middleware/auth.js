function attachUser(req, res, next) {
  res.locals.user = req.session?.user || null;
  next();
}

function requireCustomer(req, res, next) {
  if (!req.session?.user) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Please log in to continue.');
    return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  }

  if (req.session.user.role !== 'customer') {
    const error = new Error(
      'Access denied. Administrator accounts cannot access shopping cart or checkout.'
    );
    error.statusCode = 403;
    return next(error);
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.redirect('/admin/login');
  }

  if (req.session.user.role !== 'admin') {
    const error = new Error('Access denied. Administrator privileges required.');
    error.statusCode = 403;
    return next(error);
  }

  next();
}

module.exports = {
  attachUser,
  requireCustomer,
  requireAdmin
};
