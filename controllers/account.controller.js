const UserModel = require('../models/user.model');

const AccountController = {
  async index(req, res, next) {
    try {
      const user = await UserModel.findById(req.session.user.id);
      res.render('pages/account/index', {
        title: 'Account Settings — GlitchAttire',
        profile: user,
        layout: 'layouts/main'
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, _next) {
    try {
      const { name, phone } = req.body;
      await UserModel.updateProfile(req.session.user.id, {
        name: name.trim(),
        phone: phone ? phone.trim() : null
      });

      req.session.user.name = name.trim();
      req.flash('success', 'Profile updated successfully.');
      res.redirect('/account');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/account');
    }
  }
};

module.exports = AccountController;
