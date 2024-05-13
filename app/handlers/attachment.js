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

}


module.exports = {
    deleteAttachmentforFactoid,
    deleteAllAttachmentsforFactoid
}