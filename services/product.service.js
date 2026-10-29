const fs = require('fs');
const path = require('path');
const defaultPool = require('../config/db');
const ProductModel = require('../models/product.model');
const VariantModel = require('../models/variant.model');
const AuditLogger = require('./audit-logger');
const slugify = require('../utils/slugify');

const ProductService = {
  async getPublicCatalog(params) {
    return ProductModel.findPublicCatalog(params);
  },

  async getFeaturedProducts(limit = 4) {
    return ProductModel.findFeatured(limit);
  },

  async getProductBySlug(slug) {
    const product = await ProductModel.findBySlug(slug);
    if (!product || !product.is_published) {
      const error = new Error('Product not found or currently unavailable');
      error.statusCode = 404;
      throw error;
    }
    const variants = await VariantModel.findByProductId(product.id);
    return { ...product, variants };
  },

  async getAdminProductList(params) {
    return ProductModel.findAdminList(params);
  },

  async getAdminProductById(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    const variants = await VariantModel.findByProductId(product.id);
    return { ...product, variants };
  },

  async createProduct({
    categoryId,
    name,
    slug = null,
    description = '',
    price,
    imagePath = null,
    isPublished = 1,
    variants = [],
    req = null
  }) {
    const productSlug = slugify(slug || name);
    const existing = await ProductModel.findBySlug(productSlug);
    if (existing) {
      const error = new Error(`A product with the slug '${productSlug}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    const conn = await defaultPool.getConnection();
    try {
      await conn.beginTransaction();

      const createdBy = req?.session?.user?.id ?? null;
      const productId = await ProductModel.create(
        {
          categoryId,
          name: name.trim(),
          slug: productSlug,
          description: description.trim(),
          price: parseFloat(price),
          imagePath,
          isPublished: Boolean(isPublished),
          createdBy
        },
        conn
      );

      for (const variant of variants) {
        if (variant.size && variant.size.trim()) {
          const stock = Math.max(0, parseInt(variant.stock, 10) || 0);
          await VariantModel.upsert(productId, variant.size.trim().toUpperCase(), stock, conn);
        }
      }

      await conn.commit();

      const created = await this.getAdminProductById(productId);
      await AuditLogger.log({
        action: 'created',
        entity: 'product',
        entityId: productId,
        newValues: created,
        req
      });

      return created;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async updateProduct(
    id,
    {
      categoryId,
      name,
      slug = null,
      description = '',
      price,
      imagePath = null,
      isPublished = 1,
      variants = [],
      req = null
    }
  ) {
    const existing = await this.getAdminProductById(id);
    const productSlug = slugify(slug || name);

    const slugOwner = await ProductModel.findBySlug(productSlug);
    if (slugOwner && slugOwner.id !== parseInt(id, 10)) {
      const error = new Error(`A product with the slug '${productSlug}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    const conn = await defaultPool.getConnection();
    try {
      await conn.beginTransaction();

      await ProductModel.update(
        id,
        {
          categoryId,
          name: name.trim(),
          slug: productSlug,
          description: description.trim(),
          price: parseFloat(price),
          imagePath,
          isPublished: Boolean(isPublished)
        },
        conn
      );

      const activeSizes = [];
      for (const variant of variants) {
        if (variant.size && variant.size.trim()) {
          const sizeUpper = variant.size.trim().toUpperCase();
          const stock = Math.max(0, parseInt(variant.stock, 10) || 0);
          await VariantModel.upsert(id, sizeUpper, stock, conn);
          activeSizes.push(sizeUpper);
        }
      }

      // Remove variants not included in the updated sizes list
      await VariantModel.deleteNotInSizes(id, activeSizes, conn);

      await conn.commit();

      // If a new image was uploaded and there was an old image, remove previous image from disk
      if (imagePath && existing.image_path && existing.image_path !== imagePath) {
        this.safeDeleteImage(existing.image_path);
      }

      const updated = await this.getAdminProductById(id);
      await AuditLogger.log({
        action: 'updated',
        entity: 'product',
        entityId: id,
        oldValues: existing,
        newValues: updated,
        req
      });

      return updated;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async togglePublish(id, req = null) {
    const existing = await this.getAdminProductById(id);
    const newStatus = !existing.is_published;

    await ProductModel.setPublishStatus(id, newStatus);
    await AuditLogger.log({
      action: newStatus ? 'published' : 'unpublished',
      entity: 'product',
      entityId: id,
      oldValues: { is_published: existing.is_published },
      newValues: { is_published: newStatus ? 1 : 0 },
      req
    });

    return newStatus;
  },

  async deleteProduct(id, req = null) {
    const existing = await this.getAdminProductById(id);

    await ProductModel.delete(id);

    if (existing.image_path) {
      this.safeDeleteImage(existing.image_path);
    }

    await AuditLogger.log({
      action: 'deleted',
      entity: 'product',
      entityId: id,
      oldValues: existing,
      req
    });
  },

  safeDeleteImage(imagePath) {
    if (!imagePath || imagePath.startsWith('http')) {
      return;
    }
    // Only delete images located under uploads/
    if (imagePath.includes('/uploads/products/')) {
      const fullPath = path.join(__dirname, '..', 'public', imagePath.replace(/^\//, ''));
      fs.promises.unlink(fullPath).catch(() => {});
    }
  }
};

module.exports = ProductService;
