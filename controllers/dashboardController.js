const { poolPromise } = require('../models/db.model');

async function getInventory(req, res) {
    try {
        const pool = await poolPromise;

        const page = parseInt(req.query.page) || 1;  // Trang hiện tại
        const pageSize = 8;  // Số lượng sản phẩm trên mỗi trang
        const offset = (page - 1) * pageSize;

        // Truy vấn tổng số sản phẩm
        const countResult = await pool.request()
            .query('SELECT COUNT(*) AS ProductCount FROM [dbo].[ManagementInventory]');
        const productCount = countResult.recordset[0].ProductCount;

        // Kiểm tra xem có sản phẩm nào không
        if (productCount === 0) {
            return res.json({
                message: 'Không có dữ liệu hàng hóa',
                managementInventory: [],
                currentPage: page,
                totalPages: 0
            });
        }

        // Truy vấn dữ liệu chi tiết hàng hóa theo trang
        const detailResult = await pool.request()
            .query(`SELECT * FROM [dbo].[ManagementInventory]
                    ORDER BY ID
                    OFFSET ${offset} ROWS
                    FETCH NEXT ${pageSize} ROWS ONLY`);
        const managementInventory = detailResult.recordset;

        // Tính toán tổng số trang
        const totalPages = Math.ceil(productCount / pageSize);

        // Trả về dữ liệu JSON nếu là yêu cầu AJAX
        if (req.xhr) {
            return res.json({
                managementInventory,
                currentPage: page,
                totalPages: totalPages
            });
        }

        // Render trang bình thường nếu không phải AJAX
        res.render(req.params.page === 'import' ? 'pages/import' : 'index', {
            title: req.params.page === 'import' ? 'Trang Nhập Kho' : 'Danh sách hàng hóa',
            productCount,
            managementInventory,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu từ cơ sở dữ liệu:', err);
        res.status(500).send('Lỗi server');
    }
}

module.exports = {
    getInventory
};
