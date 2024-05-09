const db = require('better-sqlite3')('app.db')
const fs = require('fs')

const initScript = fs.readFileSync('./db/migration.sql', 'utf8')
db.exec(initScript)
db.close()