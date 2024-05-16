/**
 * Server API Routes.
 * All routes within this file implicitly begin with "/api/" for their endpoint.
 */
const express = require('express');
const router = express.Router();
const { getFacts, getFactByID, addFact, updateFact } = require('../handlers/factoid');
const { getTags, defineTag } = require('../handlers/tag')
const { upload, isUploadDirFull }= require('../modules/upload')

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

const ANON_USER_ID = 'zzz3737'

// API endpoint to get all facts that fulfill the given condition(s).
// Supports optional tag filtering, text searching and pagination.
router.get('/fact', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if ((req.query.pageNum && req.query.pageNum < 1) || 
        (req.query.pageSize && req.query.pageSize < 0)) {
            return res.status(400).json({message: 'Page number and size must be greater than 0.'})
        }
    try {
        let facts = getFacts(req.query.tag, req.query.searchText, req.query.pageNum, req.query.pageSize);
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

// API endpoint to add a new fact to the database.
router.post('/fact', (req, res) => {
    const { userId, content, discovery_date, note, tags } = req.body;

    // v no longer fails foreign key constraint
    const submitter_id = userId || ANON_USER_ID;
    //const submitter_id = null;

    if (!content) {
        res.status(400).json({ error: 'Content field is required' });
        return;
    }

    //const success = addFact({ submitter_id, content, note, discovery_date });
    const success = addFact({ submitter_id, content, discovery_date, note, tags }, res);

    if (success) {
        res.status(201).json({ message: 'Fact added successfully' });
    } else {
        res.status(500).json({ error: 'Failed to add fact' });
    }
});

// API endpoint to update an existing fact in the database.
router.put('/fact/:id', (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({error: 'Only admin can update facts.'})
    }
    const factID = req.params.id;
    const { content, note, discovery_date, tags } = req.body;

    const result = updateFact(factID, { content, note, discovery_date, tags });

    if (result.success) {
        res.status(200).json({ message: 'Fact updated successfully' });
    } else if (result.message === 'Fact not found') {
        res.status(404).json({ error: 'Fact not found' });
    } else {
        res.status(500).json({ error: 'Failed to update fact' });
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
    // TODO: Change with middleware once merged/pushed
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({message: 'Must have admin access to create tags'})
    }
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
            'Reported by: ' + reporter +
            '\nFact #' + factID +
            '\nFact: ' + factContent +
            '\n\nIssue: ' + reportContent,
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

router.post('/attachment', (req, res, next) => {
    res.status(200).json({message: 'Success!'})
    res.locals.factID = 1
    next()
}, upload.array('file', 3))

module.exports = router;