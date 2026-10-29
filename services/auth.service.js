const bcrypt = require('bcrypt');
const UserModel = require('../models/user.model');
const AuditLogger = require('./audit-logger');

const AuthService = {
  async registerCustomer({ name, email, password, phone = null }) {
    const existing = await UserModel.findByEmail(email.toLowerCase().trim());
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'customer',
      phone: phone ? phone.trim() : null
    });

    const user = await UserModel.findById(userId);
    await AuditLogger.log({
      userId,
      action: 'register',
      entity: 'user',
      entityId: userId,
      newValues: { name: user.name, email: user.email, role: user.role }
    });

    return user;
  },

  async loginCustomer(email, password, req = null) {
    const user = await UserModel.findByEmail(email.toLowerCase().trim());
    if (!user || user.role !== 'customer') {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('This account has been deactivated. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (req?.session) {
      const savedReturnTo = req.session.returnTo;
      await new Promise((resolve, reject) => {
        req.session.regenerate(err => {
          if (err) {
            return reject(err);
          }
          req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
          if (savedReturnTo) {
            req.session.returnTo = savedReturnTo;
          }
          req.session.save(saveErr => {
            if (saveErr) {
              return reject(saveErr);
            }
            resolve();
          });
        });
      });
    }

    await AuditLogger.log({
      userId: user.id,
      action: 'login',
      entity: 'user',
      entityId: user.id,
      req
    });

    return user;
  },

  async loginAdmin(email, password, req = null) {
    const user = await UserModel.findByEmail(email.toLowerCase().trim());
    if (!user || user.role !== 'admin') {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('This administrator account is disabled.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (req?.session) {
      const savedReturnTo = req.session.returnTo;
      await new Promise((resolve, reject) => {
        req.session.regenerate(err => {
          if (err) {
            return reject(err);
          }
          req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
          if (savedReturnTo) {
            req.session.returnTo = savedReturnTo;
          }
          req.session.save(saveErr => {
            if (saveErr) {
              return reject(saveErr);
            }
            resolve();
          });
        });
      });
    }

    await AuditLogger.log({
      userId: user.id,
      action: 'admin_login',
      entity: 'user',
      entityId: user.id,
      req
    });

    return user;
  },

  async logout(req) {
    if (req?.session?.user) {
      await AuditLogger.log({
        userId: req.session.user.id,
        action: 'logout',
        entity: 'user',
        entityId: req.session.user.id,
        req
      });

      await new Promise(resolve => {
        req.session.destroy(() => resolve());
      });
    }
  }
};

module.exports = AuthService;
