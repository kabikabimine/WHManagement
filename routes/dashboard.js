const express = require('express');
const router = express.Router();
const dashboardController = require('../Controller/dashboardController');

// Route để lấy dữ liệu Inventory với phân trang
router.get('/load-more-inventory', dashboardController.getInventory);

module.exports = router;
