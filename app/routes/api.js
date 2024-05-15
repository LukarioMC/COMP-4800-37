/**
 * Server API Routes.
 * All routes within this file implicitly begin with "/api/" for their endpoint.
 */
const express = require('express');
const router = express.Router();
const { getFacts, getFactByID, deleteFactByID } = require('../handlers/factoid');
const { getTags, defineTag, deleteTagforFactoid, deleteAllTagsforFactoid } = require('../handlers/tag');
const { deleteAttachmentforFactoid, deleteAllAttachmentsforFactoid } = require('../handlers/attachment');

const nodemailer = require('nodemailer');
// Configures email settings for reporting
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


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

// Route to get all categories.
router.get('/tags', (req, res) => {
    try {
        res.status(200).json(getTags());
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Route to add a new tag.
router.put('/tag', (req, res) => {
    if (req.body.tagName) {
        let queryRes = defineTag(req.body.tagName, req.body.isPrimary);
        if (queryRes.successful) {
            return res.status(201).json({
                message: `Successfully added tag ${req.body.tagName}.`,
            });
        } else {
            return res.status(500).json({ message: queryRes.message });
        }
    } else {
        return res.status(400).json({ message: 'Invalid args.' });
    }
});

router.post('/report', (req, res) => {
    if (!req.body.issue || !req.body.fact?.id) {
        req.flash(
            'error',
            'There was an error submitting your report. Please try again.'
        );
        return res.status(500).redirect('back');
    }
    const reporter = res.locals.user?.id || 'zzz3737';
    const factID = req.body.fact.id;
    const factContent = req.body.fact?.content || 'Unknown';
    const reportContent = req.body.issue;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        subject: 'thirty-seven.org - Fact #' + factID + ' Has Been Reported',
        text:
            'Reported by: ' +
            reporter +
            '\nFact #' +
            factID +
            '\nFact: ' +
            factContent +
            '\n\n' +
            reportContent,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ', error);
        } else {
            console.log('Email sent: ', info.response);
        }
    });
    req.flash('success', 'Report successfully sent!');
    res.redirect('back');
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
    const { factoidID } = req.params;

    try {

        deleteAllAttachmentsforFactoid(factoidID);

        deleteAllTagsforFactoid(factoidID);

        const factDeleted = deleteFactByID(factoidID);

        if (factDeleted) {
            return res.status(200).send({ message: 'Fact and associated attachments/tags deleted successfully.' });
        } else {
            return res.status(404).send({ message: 'Fact not found.' });
        }
        
    } catch (e) {
        console.error('Error deleting fact:', e);
        return res.status(500).send({ message: 'Server error.' });
    }
})

// API endpoint to approve a fact with the given id.
router.put('/api/fact/approve/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        let id = parseInt(req.params.id)
        let approved = approveFactByID(id)
        if (approved) {
            return res.status(200).send({ message: "Fact approved successfully." })
        } else {
            return res.status(404).send({ message: "Fact not found." })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({ message: "Server error." })
    }
})

module.exports = router;
