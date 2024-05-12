/**
 * Server API Routes.
 * All routes within this file implicitly begin with "/api/" for their endpoint.
 */
const express = require('express');
const router = express.Router();
const { getFacts, getFactByID } = require('../handlers/factoid');

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

// API endpoint to add a new fact to the database.
router.post('/fact', (req, res) => {
  // Extract necessary information from the request body
    const { content, note, userId } = req.body;

    // Perform any necessary validation on the incoming data
    if (!content || !userId) {
        res.status(400).json({ error: 'Missing required information' });
        return;
    }

    // Call addFact function to add the new fact to the database
    const success = addFact({ submitter_id: userId, content, note });

    if (success) {
        res.status(201).json({ message: 'Fact added successfully' });
    } else {
        res.status(500).json({ error: 'Failed to add fact' });
    }
});

// API endpoint to update an existing fact in the database.
router.put('/fact', (req, res) => {
  // Extract necessary information from the request body
    const factID = req.params.factID;
    const { content, note, discovery_date } = req.body;

    // Call updateFact function to update the existing fact in the database
    const success = updateFact(factID, { content, note, discovery_date });

    if (success) {
        res.status(200).json({ message: 'Fact updated successfully' });
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
