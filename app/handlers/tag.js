const db = require('better-sqlite3')('app.db');
const { SqliteError } = require('better-sqlite3');

/**
 * Returns all categories in the database with primary categories listed first.
 * @returns A list of categories.
 */
function getTags() {
    let getTagsStmt = db.prepare('SELECT * FROM category ORDER BY is_primary DESC')
    return getTagsStmt.all()
}

/**
 * Adds a new category to the database with the given name and optional isPrimary flag.
 * @param {string} name Category name.
 * @param {boolean} isPrimary Whether the category is primary or not.
 * @returns Object with successful property. If tag addition occured without error, successful is true.
 *  Otherwise, successful is false and message property will be set.
 */
function defineTag(name, isPrimary = false) {
    try {
        let addTagStmt = db.prepare('INSERT INTO category (name, is_primary) VALUES (?, ?)')
        addTagStmt.run(name, isPrimary ? 1 : 0)
        return {successful: true}
    } catch (err) {
        if (err instanceof SqliteError && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return {successful: false, message: 'Category name already in use.'}
        } else {
            return {successful: false, message: err.message}
        }
    }

}

module.exports = { 
    getTags,
    defineTag 
}