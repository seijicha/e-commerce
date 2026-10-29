const { body } = require('express-validator');

const checkoutValidator = [
  body('shipping_name')
    .trim()
    .notEmpty()
    .withMessage('Full recipient name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  body('shipping_phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone number is required.')
    .isLength({ min: 7, max: 30 })
    .withMessage('Please enter a valid phone number.'),
  body('shipping_address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required.')
    .isLength({ min: 5, max: 255 })
    .withMessage('Address must be between 5 and 255 characters.'),
  body('shipping_city')
    .trim()
    .notEmpty()
    .withMessage('City / Municipality is required.')
    .isLength({ min: 2, max: 100 }),
  body('shipping_postal_code')
    .trim()
    .notEmpty()
    .withMessage('Postal / ZIP code is required.')
    .isLength({ min: 3, max: 20 })
    .withMessage('Please enter a valid postal code.'),
  body('shipping_country')
    .trim()
    .notEmpty()
    .withMessage('Country is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Please select a valid country.'),
  body('payment_method')
    .optional()
    .isIn(['cod', 'gcash', 'bank_transfer'])
    .withMessage('Invalid payment method selected.')
];

module.exports = {
  checkoutValidator
};
