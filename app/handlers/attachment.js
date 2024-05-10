const db = require('better-sqlite3')('app.db');

function deleteAttachmentforFactoid(attachmentID){
    try {
        const result = db.run('DELETE FROM attachments WHERE id = ?', attachmentID);
        return result.changes > 0;
    } catch (e) {
        console.error('Error deleting attachment:', e);
        return false;
    }
}

module.exports = {
    deleteAttachmentforFactoid,
}