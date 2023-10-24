require('dotenv').config()
const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const { MONGODB_URI } = require('./config/connection')
const apiRoutes = require('./routes/apiRoutes')
const htmlRoutes = require('./routes/htmlRoutes')
const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'mongo-blog-session',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
  store,
  resave: true,
  saveUninitialized: false
}));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('./public'))

app.use('/api', apiRoutes)
app.use('/', htmlRoutes)

module.exports = app
