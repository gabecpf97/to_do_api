const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const logger = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJwt = require('passport-jwt');
const JWTStrategy = passportJwt.Strategy;
const ExtractJWT = passportJwt.ExtractJwt;

const db = require('./connectDB');
const indexRouter = require('./routes/index');
const app = express();

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  (email, password, done) => {
    const sql = `SELECT * FROM users WHERE email = '${email}'`;
    db.db_query(sql, (err, result) => {
      if (err)
        return done(err);
      if (result.length < 1) 
        return done(null, false, {message: 'Email not found'});
      bcrypt.compare(password, result[0].password, (err, response) => {
        if (err)
          return next(err);
        if (!response)
          return done(null, false, {message: 'Password incorrect'});
        return done(null, result[0], 'Loged in');
      });
    });
  }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.S_KEY,
  },
  (jwtPayload, cb) => {
    const sql = `SELECT * FROM users WHERE id = '${jwtPayload.user.id}'`;
    db.db_query(sql, (err, result) => {
      if (err)
        return cb(err);
      if (result.length < 1) 
        return cb(new Error('Please log in or sign up'));
      return cb(null, result[0]);
    });
  }
));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({err: err.message || err});
});

module.exports = app;
