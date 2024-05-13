const db = require('better-sqlite3')('app.db');

function deleteTagforFactoid(factoidID, categoryID){
    try {
        const result = db.run('DELETE FROM Tag WHERE factoid_id = ? AND category_id = ?', [factoidID, categoryID]);
        return result.changes > 0;
    } catch (e) {
        console.error('Error deleting tag:', e);
        return false;
    }
}

function deleteAllTagsforFactoid(factoidID){
    try {
        const tags = db.prepare('SELECT * FROM Tag WHERE factoid_id = ?').all(factoidID)
    
        tags.forEach(tag => {
            deleteTagforFactoid(tag.factoidID, tag.categoryID);
        });

    } catch (e) {

    }
}

module.exports = {
    deleteTagforFactoid,
    deleteAllTagsforFactoid
}