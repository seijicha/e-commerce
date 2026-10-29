const express = require('express');
const router = express.Router();
const ShopController = require('../controllers/shop.controller');

router.get('/', ShopController.index);
router.get('/shop', ShopController.catalog);
router.get('/shop/:slug', ShopController.show);

module.exports = router;
