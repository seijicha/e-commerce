const ProductService = require('../../services/product.service');
const CategoryService = require('../../services/category.service');
const { getPagination } = require('../../utils/pagination');

function parseVariantsFromBody(body) {
  const sizes = Array.isArray(body['variant_sizes[]'])
    ? body['variant_sizes[]']
    : body['variant_sizes[]']
      ? [body['variant_sizes[]']]
      : body.variant_sizes
        ? Array.isArray(body.variant_sizes)
          ? body.variant_sizes
          : [body.variant_sizes]
        : [];

  const stocks = Array.isArray(body['variant_stocks[]'])
    ? body['variant_stocks[]']
    : body['variant_stocks[]']
      ? [body['variant_stocks[]']]
      : body.variant_stocks
        ? Array.isArray(body.variant_stocks)
          ? body.variant_stocks
          : [body.variant_stocks]
        : [];

  const variants = [];
  for (let i = 0; i < sizes.length; i++) {
    if (sizes[i] && sizes[i].trim()) {
      variants.push({
        size: sizes[i].trim(),
        stock: parseInt(stocks[i], 10) || 0
      });
    }
  }
  return variants;
}

const ProductController = {
  async index(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 10;
      const { category, search, status } = req.query;

      const isPublished = status === 'published' ? 1 : status === 'draft' ? 0 : '';

      const { rows: products, total } = await ProductService.getAdminProductList({
        categoryId: category,
        search,
        isPublished,
        page,
        limit
      });

      const categories = await CategoryService.getAllCategories();
      const pagination = getPagination(total, page, limit);

      res.render('admin/products/index', {
        title: 'Manage Products — Admin Console',
        products,
        categories,
        pagination,
        activeCategory: category || '',
        searchQuery: search || '',
        activeStatus: status || '',
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.render('admin/products/new', {
        title: 'New Product — Admin Console',
        categories,
        product: null,
        formData: {},
        errors: {},
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async store(req, res, next) {
    try {
      const { name, category_id, slug, description, price, is_published } = req.body;
      const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;
      const variants = parseVariantsFromBody(req.body);

      const product = await ProductService.createProduct({
        categoryId: category_id,
        name,
        slug,
        description,
        price,
        imagePath,
        isPublished: is_published === '1' || is_published === 'on' || is_published === true,
        variants,
        req
      });

      req.flash('success', `Product "${product.name}" created successfully.`);
      res.redirect('/admin/products');
    } catch (err) {
      req.flash('error', err.message);
      try {
        const categories = await CategoryService.getAllCategories();
        res.status(err.statusCode || 400).render('admin/products/new', {
          title: 'New Product — Admin Console',
          categories,
          product: null,
          formData: req.body,
          errors: {},
          layout: 'layouts/admin'
        });
      } catch (innerErr) {
        next(innerErr);
      }
    }
  },

  async show(req, res, next) {
    try {
      const product = await ProductService.getAdminProductById(req.params.id);
      res.render('admin/products/show', {
        title: `${product.name} — Admin Console`,
        product,
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async edit(req, res, next) {
    try {
      const product = await ProductService.getAdminProductById(req.params.id);
      const categories = await CategoryService.getAllCategories();
      res.render('admin/products/edit', {
        title: `Edit ${product.name} — Admin Console`,
        product,
        categories,
        formData: product,
        errors: {},
        layout: 'layouts/admin'
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, category_id, slug, description, price, is_published } = req.body;
      const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;
      const variants = parseVariantsFromBody(req.body);

      const product = await ProductService.updateProduct(id, {
        categoryId: category_id,
        name,
        slug,
        description,
        price,
        imagePath,
        isPublished: is_published === '1' || is_published === 'on' || is_published === true,
        variants,
        req
      });

      req.flash('success', `Product "${product.name}" updated successfully.`);
      res.redirect('/admin/products');
    } catch (err) {
      req.flash('error', err.message);
      try {
        const product = await ProductService.getAdminProductById(req.params.id);
        const categories = await CategoryService.getAllCategories();
        res.status(err.statusCode || 400).render('admin/products/edit', {
          title: `Edit ${product.name} — Admin Console`,
          product,
          categories,
          formData: req.body,
          errors: {},
          layout: 'layouts/admin'
        });
      } catch (innerErr) {
        next(innerErr);
      }
    }
  },

  async togglePublish(req, res, _next) {
    try {
      const newStatus = await ProductService.togglePublish(req.params.id, req);
      req.flash(
        'success',
        newStatus ? 'Product published to store.' : 'Product hidden from public catalog.'
      );
      res.redirect('/admin/products');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/products');
    }
  },

  async delete(req, res, _next) {
    try {
      await ProductService.deleteProduct(req.params.id, req);
      req.flash('success', 'Product and its size variants deleted successfully.');
      res.redirect('/admin/products');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/products');
    }
  }
};

module.exports = ProductController;
