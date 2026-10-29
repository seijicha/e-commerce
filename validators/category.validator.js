const { body } = require('express-validator');

const categoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Category name must be between 2 and 80 characters.'),
  body('slug')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category slug must not exceed 100 characters.')
];

module.exports = {
  categoryValidator
};
