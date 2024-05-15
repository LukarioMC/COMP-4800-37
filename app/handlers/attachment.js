const db = require('better-sqlite3')('app.db');

function deleteAttachmentforFactoid(attachmentID){
    try {
        const deleteAttachmentStatement = db.prepare('DELETE FROM Attachment WHERE id = ?');
        const result = deleteAttachmentStatement.run(attachmentID);
        return result.changes > 0;
    } catch (e) {
        console.log('Error deleting attachment:', e);
        return false;
    }
}

function deleteAllAttachmentsforFactoid(factoidID) {
    try {
        const getAllAttachmentsStatement = db.prepare('SELECT * FROM Attachment WHERE factoid_id = ?')
            
        const allAttachmentsForFact = getAllAttachmentsStatement.all(factoidID);
     
        if (allAttachmentsForFact.length === 0) {
            console.log("No attachments found for the factoid.");
            return true; // Return true as there are no attachments to delete
        }
        
        allAttachmentsForFact.forEach(attachment => {
            const result = deleteAttachmentforFactoid(attachment.id);
            if (!result) {
                throw new Error(`Error deleting attachment with ID ${attachment.id}`);
            }
        });

        return true; // Return true if all attachments are deleted successfully
    } catch (error) {
        console.error('Error deleting attachments for the factoid:', error.message);
        return false; 
    }
}


module.exports = {
    deleteAttachmentforFactoid,
    deleteAllAttachmentsforFactoid
}