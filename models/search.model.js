const { sql, poolPromise } = require('./db.model'); // Đường dẫn đến file kết nối cơ sở dữ liệu của bạn

const search = async (query) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('query', sql.VarChar, `%${query}%`)
      .query('SELECT * FROM ManagementInventory WHERE EngName LIKE @query OR Epicor LIKE @query');
    return result.recordset;
  } catch (error) {
    throw new Error('Database query failed: ' + error.message);
  }
};

module.exports = {
  search
};
