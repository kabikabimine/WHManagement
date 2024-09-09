var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var createError = require('http-errors');
var AuthController = require('./controllers/AuthController');
var dashboardController = require('./controllers/dashboardController');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Cấu hình view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cấu hình session
app.use(session({
  secret: 'your-secret-key', // Thay đổi key cho bảo mật
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Đặt secure: true nếu sử dụng HTTPS
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware kiểm tra đăng nhập
function checkAuth(req, res, next) {
  if (!req.session.employeeId) {
    return res.redirect('/login');
  }
  next();
}

// Route chính
app.get('/', checkAuth, dashboardController.getInventory);

// Route cho API
app.get('/getInventory', checkAuth, dashboardController.getInventory);

// Route đăng nhập
app.get('/login', (req, res) => {
  res.render('login/login');
});
app.post('/login', AuthController.login);

// Route đăng xuất
app.post('/logout', AuthController.logout);

// Route cho trang nhập kho
app.get('/pages', checkAuth, (req, res) => {
  res.render('pages/import');
});

// Kiểm tra và sử dụng router chính xác
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
