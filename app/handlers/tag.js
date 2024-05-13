const db = require('better-sqlite3')('app.db');
/**
 * Returns all categories in the database with primary categories listed first.
 * @returns A list of categories.
 */
function getTags() {
    let getTagsStmt = db.prepare('SELECT * FROM category ORDER BY is_primary DESC')
    return getTagsStmt.all()
}

module.exports = getTags