const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    req.flash(
      'error',
      'Too many attempts from this IP address. Please wait 15 minutes before trying again.'
    );
    const redirectUrl = req.originalUrl.includes('admin') ? '/admin/login' : '/login';
    return res.status(429).redirect(redirectUrl);
  }
});

module.exports = {
  authRateLimiter
};
