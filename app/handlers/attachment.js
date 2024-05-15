const db = require('better-sqlite3')('app.db');

/**
 * Deletes the attachment with the specified attachment ID from the database.
 * @param {number} attachmentID The ID of the attachment to delete.
 * @returns {boolean} True if the attachment is deleted successfully, false otherwise.
 */
function deleteAttachmentforFactoid(attachmentID){
    try {
        const deleteAttachmentStatement = db.prepare('DELETE FROM Attachment WHERE id = ?');
        const result = deleteAttachmentStatement.run(attachmentID);
        return result.changes > 0;
    } catch (e) {
        console.error('Error deleting attachment:', e);
        return false;
    }
}

/**
 * Deletes all attachments associated with a specific factoid
 * @param {number} factoidID The ID of the factoid whose attachments are to be deleted
 * @returns {boolean} True if all attachments are deleted successfully or if no attachments are found, false otherwise.
 */
function deleteAllAttachmentsforFactoid(factoidID) {
    try {
        const getAllAttachmentsStatement = db.prepare('SELECT * FROM Attachment WHERE factoid_id = ?')
            
        const allAttachmentsForFact = getAllAttachmentsStatement.all(factoidID);
     
        if (allAttachmentsForFact.length === 0) {
            return true;
        }
        
        allAttachmentsForFact.forEach(attachment => {
            let result = deleteAttachmentforFactoid(attachment.id);
            if (!result) {
                throw new Error(`Error deleting attachment with ID ${attachment.id}`);
            }
        });

        return true;
    } catch (error) {
        console.error('Error deleting attachments for the factoid:', error.message);
        return false; 
    }
}

module.exports = {
    deleteAttachmentforFactoid,
    deleteAllAttachmentsforFactoid
}