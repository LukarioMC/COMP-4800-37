/**
 * Server API Routes.
 * All routes within this file implicitly begin with "/api/" for their endpoint.
 */
const express = require('express');
const router = express.Router();
const { getFacts, getFactByID } = require('../handlers/factoid');
const { getTags, defineTag } = require('../handlers/tag')

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
        res.status(200).json(getTags())
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Server error."})
    }
})

// Route to add a new tag.
router.put('/tag', (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({message: 'Must have admin access to create tags'})
    }
    if (req.body.tagName) {
        let queryRes = defineTag(req.body.tagName, req.body.isPrimary)
        if (queryRes.successful) {
            return res.status(201).json({message: `Successfully added tag ${req.body.tagName}.`})
        } else {
            return res.status(500).json({message: queryRes.message})
        }
    } else {
        return res.status(400).json({message: 'Invalid args.'})
    }
})

router.post('/report', (req, res) => {
    const reporter = res.locals.user?.id || 'Anonymous User';
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        subject:
            'thirty-seven.org - Fact #' +
            req.body.fact.id +
            ' Has Been Reported',
        text:
            'Reported by: ' +
                reporter +
                '\nFact #' +
                req.body.fact.id +
                '\nFact: ' +
                req.body.fact.content +
                '\n\n' +
                req.body.report.issue || 'No issues!',
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ', error);
        } else {
            console.log('Email sent: ', info.response);
        }
    });
    res.redirect('back');
});

module.exports = router;
