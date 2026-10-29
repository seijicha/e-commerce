const express = require('express');
const router = express.Router();
const CategoryController = require('../../controllers/admin/category.controller');
const { categoryValidator } = require('../../validators/category.validator');
const { handleValidation } = require('../../middleware/validate');

router.get('/', CategoryController.index);
router.post('/', categoryValidator, handleValidation(), CategoryController.store);
router.put('/:id', categoryValidator, handleValidation(), CategoryController.update);
router.delete('/:id', CategoryController.delete);

module.exports = router;
