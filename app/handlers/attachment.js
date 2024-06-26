const db = require('../modules/db');
const { deleteUploads, inferType, parseYoutubeUrlToEmbeded } = require('../modules/upload');

/**
 * Deletes the attachment with the specified attachment ID from the database.
 * @param {number} attachmentID The ID of the attachment to delete.
 * @returns {boolean} True if the attachment is deleted successfully, false otherwise.
 */
function deleteAttachmentforFactoid(attachmentID) {
    try {
        const deleteAttachmentStatement = db.prepare(
            'DELETE FROM Attachment WHERE id = ? RETURNING link, type'
        );
        const { link, type } = deleteAttachmentStatement.get(attachmentID);
        if (type !== 'youtube' && type !== 'website') {
            deleteUploads([link]);
        }
        return link;
    } catch (e) {
        console.log('Error deleting attachment:', e);
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
        const getAllAttachmentsStatement = db.prepare(
            'SELECT * FROM Attachment WHERE factoid_id = ?'
        );
        const allAttachmentsForFact = getAllAttachmentsStatement.all(factoidID);

        if (allAttachmentsForFact.length === 0) {
            return true;
        }

        allAttachmentsForFact.forEach((attachment) => {
            let result = deleteAttachmentforFactoid(attachment.id);
            if (!result) {
                throw new Error(
                    `Error deleting attachment with ID ${attachment.id}`
                );
            }
        });

        return true;
    } catch (error) {
        console.log('Error deleting attachments for the factoid:', error);
        return false;
    }
}

/**
 * Creates attachments in the database with the given path and fact ID.
 * @param {Array<string>} paths string array containing filenames
 * @param {integer} factID fact ID
 */
function insertAttachments(paths = [], factID) {

    let insertAttachmentStmt = db.prepare(`
        INSERT INTO attachment (factoid_id, link, type) 
        VALUES (?, ?, ?)
    `)
    
    paths.forEach((path) => {
        try {
            const pathType = inferType(path);
            if (pathType === 'youtube') {
                path = parseYoutubeUrlToEmbeded(path);
                if (!path) throw new Error(`Could not embed youtube link! (${path})`);
            }
            insertAttachmentStmt.run(factID, path, pathType)
        } catch (err) {
            throw new Error(`Failed to insert attachment ${path} because -> ${err.message}`)
        }
    })
}

module.exports = {
    deleteAttachmentforFactoid,
    deleteAllAttachmentsforFactoid,
    insertAttachments
};
