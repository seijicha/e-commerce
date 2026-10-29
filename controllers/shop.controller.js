const ProductService = require('../services/product.service');
const CategoryService = require('../services/category.service');
const { getPagination } = require('../utils/pagination');

const ShopController = {
  async index(req, res, next) {
    try {
      const featured = await ProductService.getFeaturedProducts(8);
      const categories = await CategoryService.getAllCategories();
      res.render('pages/home/index', {
        title: 'GlitchAttire — Heavyweight Cyberpunk & Distorted Streetwear',
        featured,
        categories,
        isFullWidth: true,
        layout: 'layouts/main'
      });
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ER_BAD_DB_ERROR') {
        return res.render('pages/home/index', {
          title: 'GlitchAttire — Heavyweight Cyberpunk & Distorted Streetwear',
          featured: [],
          categories: [],
          isFullWidth: true,
          layout: 'layouts/main'
        });
      }
      next(err);
    }
  },

  async catalog(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 12;

      const rawCategory = Array.isArray(req.query.category)
        ? req.query.category[req.query.category.length - 1]
        : req.query.category;
      const category =
        typeof rawCategory === 'string' && rawCategory.trim() ? rawCategory.trim() : null;

      const rawQ = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
      const q = typeof rawQ === 'string' ? rawQ.trim() : '';

      const rawSort = Array.isArray(req.query.sort)
        ? req.query.sort[req.query.sort.length - 1]
        : req.query.sort;
      const sort = typeof rawSort === 'string' && rawSort.trim() ? rawSort.trim() : 'newest';

      const { rows: products, total } = await ProductService.getPublicCatalog({
        categorySlug: category,
        query: q,
        sort,
        page,
        limit
      });

      const categories = await CategoryService.getAllCategories();
      const currentCategoryObj = category ? categories.find(c => c.slug === category) : null;
      const pagination = getPagination(total, page, limit);

      const pageTitle = currentCategoryObj
        ? `${currentCategoryObj.name} — GlitchAttire`
        : 'Catalog — GlitchAttire';

      res.render('pages/shop/index', {
        title: pageTitle,
        products,
        categories,
        currentCategory: currentCategoryObj,
        pagination,
        activeCategory: category,
        searchQuery: q,
        activeSort: sort,
        layout: 'layouts/main'
      });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const product = await ProductService.getProductBySlug(req.params.slug);

      res.render('pages/shop/show', {
        title: `${product.name} — GlitchAttire`,
        product,
        isFullWidth: true,
        layout: 'layouts/main'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ShopController;
