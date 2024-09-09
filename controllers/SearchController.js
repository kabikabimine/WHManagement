const { sql, poolPromise } = require('../models/db.model'); // Đảm bảo đường dẫn đúng

const search = async (req, res) => {
  const query = req.query.query || ''; // Giá trị tìm kiếm
  const page = parseInt(req.query.page) || 1;  // Trang hiện tại
  const pageSize = 8;  // Số lượng sản phẩm trên mỗi trang
  const offset = (page - 1) * pageSize;

  try {
    const pool = await poolPromise; // Kết nối đến pool

    // Đếm tổng số kết quả tìm kiếm
    const countResult = await pool.request()
      .input('query', sql.VarChar, `%${query}%`)
      .query(`SELECT COUNT(*) AS ProductCount
              FROM [dbo].[ManagementInventory]
              WHERE EngName LIKE @query OR Epicor LIKE @query`);
    const productCount = countResult.recordset[0].ProductCount;

    // Truy vấn chi tiết các kết quả tìm kiếm theo phân trang
    const searchResults = await pool.request()
      .input('query', sql.VarChar, `%${query}%`)
      .query(`SELECT * FROM [dbo].[ManagementInventory]
              WHERE EngName LIKE @query OR Epicor LIKE @query
              ORDER BY ID
              OFFSET ${offset} ROWS
              FETCH NEXT ${pageSize} ROWS ONLY`);
    const managementInventory = searchResults.recordset;

    // Trả về dữ liệu JSON
    res.json({
      productCount,
      managementInventory,
      currentPage: page,
      totalPages: Math.ceil(productCount / pageSize)
    });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm dữ liệu:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  search
};
