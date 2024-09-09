const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(403); // Không có token thì chặn truy cập

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token không hợp lệ
    req.user = user;
    next(); // Token hợp lệ, cho phép tiếp tục
  });
}

module.exports = authenticateToken;
