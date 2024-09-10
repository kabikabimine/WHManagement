const sql = require('mssql');
const { poolPromise } = require('../models/db.model');

exports.importData = async (req, res) => {
  try {
    const { epicor, vnname, name, manufacturer, pocode, quantityTotal, inputer } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!epicor || !vnname || !name || !manufacturer || !pocode || !quantityTotal || !inputer) {
      return res.status(400).send('All fields are required');
    }

    // Lấy pool kết nối
    const pool = await poolPromise;

    // Thực hiện câu truy vấn SQL để thêm dữ liệu
    const result = await pool.request()
      .input('epicor', sql.NVarChar, epicor)
      .input('vnname', sql.NVarChar, vnname)
      .input('name', sql.NVarChar, name)
      .input('manufacturer', sql.NVarChar, manufacturer)
      .input('pocode', sql.NVarChar, pocode)
      .input('quantityTotal', sql.Int, quantityTotal)
      .input('inputer', sql.NVarChar, inputer)
      .query(`INSERT INTO ManagementInventory (Epicor, VNName, EngName, Manufacturer, POCode, QuantityTotal, Inputer)
              VALUES (@epicor, @vnname, @name, @manufacturer, @pocode, @quantityTotal, @inputer)`);

    res.send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
};
