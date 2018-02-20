var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

if (!process.env.REDIS_HOST) process.env.REDIS_HOST = 'redis://localhost';
// else process.env.REDIS_HOST = 'redis://' +

if (!process.env.PG_HOST) process.env.PG_HOST = 'localhost';

var redis = require("redis"),
    redisClient = redis.createClient(process.env.REDIS_HOST);

const { Pool, Client } = require('pg');

const client = new Client({
  user: process.env.PG_USER || 'alexmc',
  host: process.env.PG_HOST,
  database: process.env.PG_DB || 'mypsqldb',
  password: process.env.PG_PASS ? process.env.PG_PASS : '',
  port: process.env.PG_PORT || 5432,
});

client.connect();

app.set('pgClient', client);



// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

app.set('redisClient', redisClient);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  console.log(process.env.REDIS_HOST);
  redisClient.lpush("log", req.url, (err, res) => {
    if (err) console.log('Error writing to redis');
    else console.log(`${req.url} written to relis list "log"`);
    next();
  });
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
