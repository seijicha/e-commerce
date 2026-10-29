const { doubleCsrf, invalidCsrfTokenError } = require('csrf-csrf');
const env = require('../config/env');

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => env.SESSION_SECRET,
  cookieName: 'glitchattire.csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production'
  },
  size: 32,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: req => req.body?._csrf || req.headers['x-csrf-token'] || req.query?._csrf
});

function attachCsrfToken(req, res, next) {
  res.locals.csrfToken = generateToken(req, res);
  next();
}

function handleCsrfError(err, req, res, next) {
  if (err === invalidCsrfTokenError || err.code === 'EBADCSRFTOKEN') {
    req.flash('error', 'Form submission expired or invalid security token. Please try again.');
    const redirectUrl = req.header('Referer') || '/';
    return res.status(403).redirect(redirectUrl);
  }
  next(err);
}

module.exports = {
  doubleCsrfProtection,
  attachCsrfToken,
  handleCsrfError
};
