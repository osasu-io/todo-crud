// load the .env file so we can use environment variables like MONGO_URL
require('dotenv').config()

// load all the packages we need
const express = require('express')
const app = express()
const port = process.env.PORT || 8080 // use 8080 unless something else is set
const mongoose = require('mongoose') // this lets us talk to MongoDB in an easier way
const passport = require('passport') // for login/signup
const flash = require('connect-flash') // lets us show messages in the UI

const morgan = require('morgan') // logs every request to the terminal
const cookieParser = require('cookie-parser') // lets us read cookies
const bodyParser = require('body-parser') // lets us grab data from forms
const session = require('express-session') // keeps users logged in across pages

const configDB = require('./config/database.js') // this has our MongoDB connection info

// tell mongoose to connect to the MongoDB database
mongoose.connect(configDB.url, {
  useNewUrlParser: true,        // not sure what this does yet but docs say use it
  useUnifiedTopology: true      // makes connection more stable
})
.then(() => {
  console.log(' connected to MongoDB')
  // once we're connected to DB, then we load the routes
  require('./app/routes.js')(app, passport, mongoose.connection) // we pass db into routes
})
.catch(err => console.error('MongoDB connection error:', err))

// passport setup
require('./config/passport')(passport) // load the auth stuff

// middlewares we need to make the app run right
app.use(morgan('dev')) // log requests in the console
app.use(cookieParser()) // read cookies
app.use(bodyParser.json()) // grab data as JSON (e.g. from fetch requests)
app.use(bodyParser.urlencoded({ extended: true })) // grab data from forms
app.use(express.static('public')) // let us use css/js/img files in /public folder

app.set('view engine', 'ejs') // we are using EJS templates

// these are for login sessions (keeps users logged in)
app.use(session({
  secret: 'rcbootcamp2021b', // kind of like a password for sessions
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize()) // start up passport
app.use(passport.session()) // make sure sessions and passport work together
app.use(flash()) // use flash messages to show login/signup errors


app.listen(port)
console.log('Connected on port ' + port)
