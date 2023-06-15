
//- Developed By: Constant Marks and Michael Nutt
//- Last Modified: 11/25/2019
var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var MongoDBStore = require('connect-mongodb-session')(session);
var path = require('path');
var logger = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');

var usersRouter = require('./routes/user');
var articleRouter = require('./routes/article');
var loginRouter = require('./routes/login');
var homeRouter = require('./routes/index');

var app = express();
app.listen(8000,'0.0.0.0')

var mongoose = require('mongoose');
// var mongoDB = 'mongodb://newsDev:newB@10.125.187.72:9002/news';
var mongoDB = 'mongodb+srv://admin:UkIviLy2FbfupOy7@newb.a31n6wu.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoDB,{
    dbName : 'newb',
    useNewUrlParser: true,
    useUnifiedTopology:true, 
    useFindAndModify:false });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
// mongoose.set('useFindAndModify', false);

var store = new MongoDBStore({
  uri: mongoDB,
  databaseName : 'newb',
  collection: 'sessions'
});

store.on('error', function(error){
  console.log(error);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'dead or alive',
  resave: false,
  saveUninitialized: false,
  store: store
}));
// app.use(csrf({secure:true,httpOnly:false}) );
app.use(passport.authenticate('session'));
app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});
// app.use(function(req, res, next) {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(passport.initialize());
// app.use(passport.session());
app.use(flash());


app.use(function(req, res, next){
  res.locals.success_messages = req.flash('success_messages');
  res.locals.pass_error = req.flash('pass_error');
  res.locals.user_error  = req.flash('user_error');
  next();
});

//Models and routes
require('./models/users');
require('./config/passport')(passport)
require('./routes/article')
require('./routes/user')
require('./routes/index')


app.use('/', homeRouter);
app.use('/article', articleRouter);
app.use('/user', usersRouter);
app.use('/login', loginRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});


module.exports = app;
