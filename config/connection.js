const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI ||
  `mongodb://localhost:27017/${process.env.npm_package_config_DB_NAME}`;

mongoose.connect(MONGODB_URI)

module.exports = {connection: mongoose.connection, MONGODB_URI}
