// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var env = require('dotenv').config()
var indexRouter = require('./routes/user.router');
var ProductRouter = require('./routes/product.router');
var cartRouter = require('./routes/productcart.router')
var orderRouter = require('./routes/order.router')
var cityStateRouter = require('./routes/city&state.router')
var productReview = require('./routes/productReview.router')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', indexRouter);
app.use('/products', ProductRouter)
app.use('/products/cart', cartRouter)
app.use('/products/review', productReview)
app.use('/image', express.static('public/images'))
app.use('/images', express.static('public/images/product'))
app.use('/user/order', orderRouter)
app.use('/city', cityStateRouter)
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
