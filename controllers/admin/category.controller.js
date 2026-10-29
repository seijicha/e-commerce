const CategoryService = require('../../services/category.service');

const CategoryController = {
  async index(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.render('admin/categories/index', {
        title: 'Manage Categories — Admin Console',
        categories,
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async store(req, res, _next) {
    try {
      const { name, slug } = req.body;
      const category = await CategoryService.createCategory({ name, slug }, req);
      req.flash('success', `Category "${category.name}" created successfully.`);
      res.redirect('/admin/categories');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/categories');
    }
  },

  async update(req, res, _next) {
    try {
      const { id } = req.params;
      const { name, slug } = req.body;
      const category = await CategoryService.updateCategory(id, { name, slug }, req);
      req.flash('success', `Category "${category.name}" updated successfully.`);
      res.redirect('/admin/categories');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/categories');
    }
  },

  async delete(req, res, _next) {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id, req);
      req.flash('success', 'Category deleted successfully.');
      res.redirect('/admin/categories');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/categories');
    }
  }
};

module.exports = CategoryController;
