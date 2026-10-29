const { body } = require('express-validator');

const addToCartValidator = [
  body('variant_id')
    .notEmpty()
    .withMessage('Please select a size / variant.')
    .isInt({ min: 1 })
    .withMessage('Invalid variant identifier.'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99.')
];

const updateCartValidator = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required.')
    .isInt({ min: 0, max: 99 })
    .withMessage('Quantity must be between 0 and 99.')
];

module.exports = {
  addToCartValidator,
  updateCartValidator
};
