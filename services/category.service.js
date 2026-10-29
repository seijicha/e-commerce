const CategoryModel = require('../models/category.model');
const AuditLogger = require('./audit-logger');
const slugify = require('../utils/slugify');

const CategoryService = {
  async getAllCategories() {
    return CategoryModel.findAll();
  },

  async getCategoryById(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  },

  async createCategory({ name, slug = null }, req = null) {
    const categorySlug = slugify(slug || name);
    const existing = await CategoryModel.findBySlug(categorySlug);
    if (existing) {
      const error = new Error(`A category with the slug '${categorySlug}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    const categoryId = await CategoryModel.create({
      name: name.trim(),
      slug: categorySlug
    });

    const created = await CategoryModel.findById(categoryId);
    await AuditLogger.log({
      action: 'created',
      entity: 'category',
      entityId: categoryId,
      newValues: created,
      req
    });

    return created;
  },

  async updateCategory(id, { name, slug = null }, req = null) {
    const existing = await this.getCategoryById(id);
    const categorySlug = slugify(slug || name);

    const slugOwner = await CategoryModel.findBySlug(categorySlug);
    if (slugOwner && slugOwner.id !== parseInt(id, 10)) {
      const error = new Error(`A category with the slug '${categorySlug}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    await CategoryModel.update(id, {
      name: name.trim(),
      slug: categorySlug
    });

    const updated = await CategoryModel.findById(id);
    await AuditLogger.log({
      action: 'updated',
      entity: 'category',
      entityId: id,
      oldValues: existing,
      newValues: updated,
      req
    });

    return updated;
  },

  async deleteCategory(id, req = null) {
    const existing = await this.getCategoryById(id);
    const productCount = await CategoryModel.countProducts(id);

    if (productCount > 0) {
      const error = new Error(
        `Cannot delete category '${existing.name}' because ${productCount} product(s) are assigned to it.`
      );
      error.statusCode = 400;
      throw error;
    }

    await CategoryModel.delete(id);
    await AuditLogger.log({
      action: 'deleted',
      entity: 'category',
      entityId: id,
      oldValues: existing,
      req
    });
  }
};

module.exports = CategoryService;
