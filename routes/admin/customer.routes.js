const express = require('express');
const router = express.Router();
const CustomerController = require('../../controllers/admin/customer.controller');

router.get('/', CustomerController.index);
router.get('/:id', CustomerController.show);
router.patch('/:id/active', CustomerController.toggleActive);

module.exports = router;
