const sqlite = require('sqlite3')

const db = new sqlite.Database('./app.db')

module.exports = db