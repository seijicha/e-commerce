const AuthService = require('../services/auth.service');

const AuthController = {
  showRegister(req, res) {
    if (req.session?.user) {
      return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/');
    }
    res.render('pages/auth/register', {
      title: 'Create Account — GlitchAttire',
      layout: 'layouts/auth',
      formData: {},
      errors: {}
    });
  },

  async register(req, res, _next) {
    try {
      const { name, email, password, phone } = req.body;
      await AuthService.registerCustomer({ name, email, password, phone });
      req.flash('success', 'Account registered successfully! Please log in.');
      res.redirect('/login');
    } catch (err) {
      res.locals.flash = {
        success: [],
        error: [err.message],
        info: []
      };
      res.status(err.statusCode || 400).render('pages/auth/register', {
        title: 'Create Account — GlitchAttire',
        layout: 'layouts/auth',
        formData: req.body,
        errors: {}
      });
    }
  },

  showLogin(req, res) {
    if (req.session?.user) {
      return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/');
    }
    res.render('pages/auth/login', {
      title: 'Customer Login — GlitchAttire',
      layout: 'layouts/auth',
      nextUrl: req.query.next || '',
      formData: {},
      errors: {}
    });
  },

  async login(req, res, _next) {
    try {
      const { email, password } = req.body;
      await AuthService.loginCustomer(email, password, req);

      req.flash('success', 'Welcome back to GlitchAttire!');
      const rawReturnTo = (req.body.next || req.session?.returnTo || '').trim();
      const returnTo = rawReturnTo.startsWith('/') ? rawReturnTo : '/';
      delete req.session?.returnTo;
      if (req.session?.save) {
        return req.session.save(() => res.redirect(returnTo));
      }
      res.redirect(returnTo);
    } catch (err) {
      res.locals.flash = {
        success: [],
        error: [err.message],
        info: []
      };
      res.status(err.statusCode || 401).render('pages/auth/login', {
        title: 'Customer Login — GlitchAttire',
        layout: 'layouts/auth',
        nextUrl: req.body.next || '',
        formData: { email: req.body.email },
        errors: {}
      });
    }
  },

  async logout(req, res, next) {
    try {
      await AuthService.logout(req);
      res.redirect('/login');
    } catch (err) {
      next(err);
    }
  },

  showAdminLogin(req, res) {
    if (req.session?.user?.role === 'admin') {
      return res.redirect('/admin');
    }
    res.render('admin/auth/login', {
      title: 'Administrator Console Login — GlitchAttire',
      layout: 'layouts/auth',
      formData: {},
      errors: {}
    });
  },

  async adminLogin(req, res, _next) {
    try {
      const { email, password } = req.body;
      await AuthService.loginAdmin(email, password, req);

      req.flash('success', 'Authenticated to Admin Console.');
      if (req.session?.save) {
        return req.session.save(() => res.redirect('/admin'));
      }
      res.redirect('/admin');
    } catch (err) {
      res.locals.flash = {
        success: [],
        error: [err.message],
        info: []
      };
      res.status(err.statusCode || 401).render('admin/auth/login', {
        title: 'Administrator Console Login — GlitchAttire',
        layout: 'layouts/auth',
        formData: { email: req.body.email },
        errors: {}
      });
    }
  },

  async adminLogout(req, res, next) {
    try {
      await AuthService.logout(req);
      res.redirect('/admin/login');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
