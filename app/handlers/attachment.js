const db = require('better-sqlite3')('app.db');

function deleteAttachmentforFactoid(attachmentID){
    try {
        const result = db.run('DELETE FROM Attachment WHERE id = ?', attachmentID);
        return result.changes > 0;
    } catch (e) {
        console.error('Error deleting attachment:', e);
        return false;
    }
}
function deleteAllAttachmentsforFactoid(attachmentID){
    try {
        const attachments = db.prepare('SELECT * FROM Attachment WHERE id = ?').all(attachmentID)
    
        attachments.forEach(attachment => {
            deleteAttachmentforFactoid(attachment.ID);
        });

    } catch (e) {

    }
}


module.exports = {
    deleteAttachmentforFactoid,
    deleteAllAttachmentsforFactoid
}