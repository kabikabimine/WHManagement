const { poolPromise } = require('../models/db.model');

// Xử lý đăng nhập
async function login(req, res) {
  const { employeeId } = req.body;
  const ipAddress = req.ip;
  console.log('Employee ID:', employeeId);

  // Kiểm tra nếu employeeId là một số hợp lệ
  if (isNaN(employeeId) || employeeId.trim() === '') {
    return res.json({ success: false, error: 'ID không hợp lệ' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('employeeId', employeeId)
      .query('SELECT * FROM [dbo].[InfoEmployee] WHERE IDEmployee = @employeeId');
    console.log("Employee : ", result.recordset);

    if (result.recordset.length > 0) {
      // Lưu thông tin vào session
      req.session.employeeId = employeeId;
      req.session.userName = result.recordset[0].Name;

      console.log('Session:', req.session);

      // Lưu lịch sử đăng nhập vào cơ sở dữ liệu
      await pool.request()
        .input('employeeId', employeeId)
        .input('ipAddress', ipAddress)
        .input('status', 'Success')
        .query('INSERT INTO [dbo].[LoginHistory] (IDEmployee, IPAddress, Status) VALUES (@employeeId, @ipAddress, @status)');

      // Trả về JSON để phản hồi yêu cầu
      res.json({ success: true, userName: req.session.userName });
    } else {
      await pool.request()
        .input('employeeId', employeeId)
        .input('ipAddress', ipAddress)
        .input('status', 'Failed')
        .query('INSERT INTO [dbo].[LoginHistory] (IDEmployee, IPAddress, Status) VALUES (@employeeId, @ipAddress, @status)');
      
      res.json({ success: false, error: 'ID này không có quyền truy cập' });
    }
  } catch (err) {
    console.error('Lỗi khi kiểm tra ID:', err);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
}

async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, error: 'Lỗi server' });
    }

    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
}

module.exports = {
  login,
  logout
};
