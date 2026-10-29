const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/admin/product.controller');
const { handleUpload } = require('../../middleware/upload');
const { doubleCsrfProtection } = require('../../middleware/csrf');
const { productValidator } = require('../../validators/product.validator');
const { handleValidation } = require('../../middleware/validate');
const CategoryService = require('../../services/category.service');

router.get('/', ProductController.index);
router.get('/new', ProductController.create);

// Multipart creation: upload runs first to parse fields, then CSRF, then validator
router.post(
  '/',
  handleUpload,
  doubleCsrfProtection,
  productValidator,
  handleValidation('admin/products/new', async () => ({
    categories: await CategoryService.getAllCategories(),
    product: null
  })),
  ProductController.store
);

router.get('/:id', ProductController.show);
router.get('/:id/edit', ProductController.edit);

// Multipart update: upload runs first to parse fields, then CSRF, then validator
router.put(
  '/:id',
  handleUpload,
  doubleCsrfProtection,
  productValidator,
  handleValidation('admin/products/edit', async req => ({
    categories: await CategoryService.getAllCategories(),
    product: { id: req.params.id }
  })),
  ProductController.update
);

router.patch('/:id/publish', ProductController.togglePublish);
router.delete('/:id', ProductController.delete);

module.exports = router;
