/**
 * Server API Routes.
 * All routes within this file implicitly begin with "/api/" for their endpoint.
 */
const express = require('express');
const router = express.Router();
const { getFacts, getFactByID } = require('../handlers/factoid');
const { deleteAttachmentforFactoid } = require('../handlers/attachment');

// API endpoint to get all facts that fulfill the given condition(s).
// Accepts query param 'tag' for filtering by tag. Can be given multiple tag arguments for finer filtering.
router.get('/fact', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let facts = getFacts(req.query.tag);
        let publicFieldFacts = facts.map((fact) => {
            let { is_approved, approval_date, ...publicFields } = fact;
            return publicFields;
        });
        return res.status(200).send(JSON.stringify(publicFieldFacts));
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: 'Server error.' });
    }
});

// API endpoint to get the fact with the given id.
router.get('/fact/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res
                .status(400)
                .send({ message: 'Fact ID is not of the correct format.' });
        }
        let fact = getFactByID(id);
        if (fact) {
            let { is_approved, approval_date, cat_id, ...publicFields } = fact;
            return res.status(200).send(JSON.stringify(publicFields));
        } else {
            return res.status(404).send({ message: 'Fact not found.' });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: 'Server error.' });
    }
});

// API endpoint to delete an attachment for a given attachemnt ID
router.delete('/api/delete/attachment/:attachmentID', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        const attachmentID = req.params.attachmentID;

        const result = deleteAttachmentforFactoid(attachmentID)

        if (result) {
            return res.status(200).send({ message: 'Attachment deleted successfully.' });
        } else {
            return res.status(404).send({ message: 'Attachment not found.' });
        }
    } catch (error) {
        console.error('Error deleting attachment:', error);
        return res.status(500).send({ message: 'Server error.' });
    }
});

// API endpoint to delete a tag for a given factoid ID and category ID
router.delete('/api/delete/fact/:factoidID/tag/:categoryID', (req, res) => {
    try {
        const { factoidID, categoryID } = req.params;
        
        const result = deleteTagForFactoid(parseInt(factoidID), parseInt(categoryID));

        if (result) {
            return res.status(200).send({ message: 'Tag deleted successfully.' });
        } else {
            return res.status(404).send({ message: 'Tag not found.' });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: 'Server error.' });
    }
});

// API endpoint to delete a fact, given the factoid ID
router.delete('/api/delete/fact/:factoidID', (req, res) => {

})

module.exports = router;
