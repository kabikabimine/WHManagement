const express = require('express');
const router = express.Router();
var dashboardController = require('../controllers/dashboardController');
const AuthController = require('../controllers/AuthController');
var SearchController = require('../controllers/SearchController'); // Đảm bảo đường dẫn đúng

// Route cho tìm kiếm
router.get('/search', SearchController.search); // Kiểm tra xem SearchController.search có được định nghĩa không
router.get('/', dashboardController.getInventory);
router.post('/login', AuthController.login);
// Route cho trang nhập kho


module.exports = router;
