var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var storage = require('./storage');
var config = require('./config');

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_TOKEN,
    callbackURL: config.FBCallback + '/login/facebook/return',
    profileFields: ['id', 'displayName', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    // You can call RegisterUser here with profile._json.id, name, and email
    // then return the ID when you call the cb function
    storage.RegisterUser(profile._json.id, profile._json.name, profile._json.email, err => {
        // What gets passed back to cb will then be called in serializeUser
        console.log("Registered user " + profile._json.id);
        return cb(null, profile._json.id);
    });
  }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
    // This value will be passed into the callback function (accessed via req.user)
console.log("serialize " + JSON.stringify(user));
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
console.log("deserialize " + obj);
    cb(null, obj);
});

var getresults = require('./routes/getresults');
var vote = require('./routes/vote');
var getsong = require('./routes/getsong');
var comment = require('./routes/comment');
var song = require('./routes/song');
var recordvote = require('./routes/recordvote');

var app = express();

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
// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.use('/getsong', getsong);
app.use('/getresults', getresults);
app.use('/vote', vote);
app.use('/comment', comment);
// REST APIs
app.use('/song', song);
app.use('/recordvote', recordvote);

// Login pages to do OAuth
app.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['email'] }));

app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
  console.log(JSON.stringify(req.user));
    res.redirect("/");
});

app.get('/', function(req, res, next) {
    res.render("index", {title: "Song of the Day", fbAppID: config.CLIENT_ID});
});

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
