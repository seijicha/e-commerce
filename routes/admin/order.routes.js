const express = require('express');
const router = express.Router();
const AdminOrderController = require('../../controllers/admin/order.controller');

router.get('/', AdminOrderController.index);
router.get('/:id', AdminOrderController.show);
router.patch('/:id/status', AdminOrderController.updateStatus);

module.exports = router;
