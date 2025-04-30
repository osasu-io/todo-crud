// Other requires
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;

var mongoose = require('mongoose');
mongoose.set('strictQuery', false);

var passport = require('passport'); // <== make sure this is early
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// Middleware setup
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret-todo-app',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 🔥 SET UP PASSPORT CONFIG FIRST!!
require('./config/passport')(passport); 
// This line MUST COME BEFORE loading routes!!!

// Connect to MongoDB
mongoose.connect(configDB.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB Connected');
    require('./app/routes.js')(app, passport, mongoose.connection); // <== Load routes AFTER passport is ready
    app.listen(port, () => {
      console.log('✅ Server running on port ' + port);
    });
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
});
