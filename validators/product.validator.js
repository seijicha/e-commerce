const { body } = require('express-validator');

const productValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('Product name must be between 2 and 150 characters.'),
  body('category_id')
    .notEmpty()
    .withMessage('Please select a category.')
    .isInt({ min: 1 })
    .withMessage('Invalid category selected.'),
  body('price')
    .notEmpty()
    .withMessage('Price is required.')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid non-negative number.'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('slug')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 180 })
    .withMessage('Slug must not exceed 180 characters.')
];

module.exports = {
  productValidator
};
