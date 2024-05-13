const db = require('better-sqlite3')('app.db');

function getTags() {
    let getTagsStmt = db.prepare('SELECT * FROM category ORDER BY is_primary DESC')
    return getTagsStmt.all()
}

module.exports = getTags