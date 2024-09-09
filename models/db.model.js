
const sql = require('mssql');

// Cấu hình kết nối
const config = {
    user: 'sa',              // Thay đổi theo thông tin của bạn
    password: '03@uacv2025!', // Thay đổi theo thông tin của bạn
    server: 'VNOEESRV\\VNAUTOSRV_SQL17', // Thay đổi theo thông tin của bạn
    database: 'ComponentManagementTB',
    options: {
        encrypt: true, // Nếu bạn đang sử dụng SSL
        trustServerCertificate: true // Bỏ qua chứng chỉ tự ký
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Kết nối cơ sở dữ liệu thành công');
        return pool;
    })
    .catch(err => {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err);
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};
