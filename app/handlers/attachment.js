const db = require('better-sqlite3')('app.db');

function deleteAttachmentforFactoid(attachmentID){
    try {
        db.prepare('DELETE FROM attachments WHERE id = ?');
        const result = deleteAttachmentStmt.run(attachmentID);
        if (result.changes > 0) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log(e);
        return false;
    }

}

module.exports = {
    deleteAttachmentforFactoid,
};