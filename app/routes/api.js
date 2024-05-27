/**
 * Server API Routes.
 * All routes within this file implicitly begin with "/api/" for their endpoint.
 */
const express = require('express');
const router = express.Router();
const { getFacts, getFactByID, deleteFactByID, approveFactByID, addFact, updateFact } = require('../handlers/factoid');
const { getTags, defineTag, deleteTagforFactoid, deleteAllTagsforFactoid } = require('../handlers/tag');
const { deleteAttachmentforFactoid, deleteAllAttachmentsforFactoid, insertAttachments } = require('../handlers/attachment');
const { submitReport, resolveReport } = require('../handlers/report');
const { rejectUnauthorizedRequest, uploadErrorHandler } = require('../middleware');
const { upload, deleteUploads } = require('../modules/upload')

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
        if (req.user?.isAdmin) {
            let facts = getFacts(null, req.query.tag, req.query.searchText, req.query.pageNum, req.query.pageSize);
            return res.status(200).json(facts);
        } else {
            let facts = getFacts(true, req.query.tag, req.query.searchText, req.query.pageNum, req.query.pageSize);
            let publicFieldFacts = facts.map((fact) => {
                let { is_approved, approval_date, ...publicFields } = fact;
                return publicFields;
            });
            return res.status(200).json(publicFieldFacts);
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Server error.' });
    }
});

// API endpoint to add a new fact to the database.
router.post('/fact', upload.array('attachment', 5), uploadErrorHandler, (req, res) => {
    let { userId, content, discovery_date, note, tag, attachment, name, email, country } = req.body.data ? JSON.parse(req.body.data) : req.body
    
    if (!content) return res.status(400).json({ error: 'Content field is required' });
    
    if (!discovery_date) discovery_date = undefined;
    if (req.user) userId = req.user.id
    let submitter_id = userId || ANON_USER_ID;

    if (typeof attachment === 'string') attachment = [attachment]
    let attachments = attachment && res.locals.filenames ? attachment.concat(res.locals.filenames) : (attachment || res.locals.filenames || [])
    
    let tags = typeof tag === 'string' ? [tag] : tag
    tags = tags || []

    attachments = attachments.filter(att => att !== '')
    tags = tags.filter(tag => tag !== '')

    try {
        addFact({ submitter_id, content, discovery_date, note, tags, attachments, anonData: {name: name, email: email, country: country}});
        // Send email after adding fact
        const submitter = res.locals.user?.id || 'zzz3737';
        const factContent = req.body.content || 'Unknown';
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECEIVER,
            subject: 'thirty-seven.org - New Fact has been Submitted for Approval',
            html:
                `<p> Submitted by: ${submitter}
                <br> Fact: ${factContent}
                <br><br> Click <a href=${process.env.SITE_LINK}>here</a>
                to go to the 37 admin dashboard for more details. You may need to log in. </p>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email: ', error);
            } else {
                console.log('Email sent: ', info.response);
            }
        });
        
        return res.status(201).json({message: 'Successfully added fact.'})
    } catch (err) {
        deleteUploads(res.locals.filenames)
        return res.status(400).json({message: err.message})
    }
});

// API endpoint to update an existing fact in the database.
router.put('/fact/:id', rejectUnauthorizedRequest, (req, res) => {
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
        let fact = getFactByID(id, !req.user?.isAdmin);
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
router.put('/tag', rejectUnauthorizedRequest, (req, res) => {
    if (req.body.tagName) {
        let queryRes = defineTag(req.body.tagName, req.body.isPrimary);
        if (queryRes.successful) {
            req.flash('success', `Successfully added tag ${req.body.tagName}.`);
            return res.status(201).redirect('back');
        } else {
            req.flash('error', 'Error: ' + queryRes.message);
            return res.status(500).redirect('back');
        }
    } else {
        req.flash('error', 'Error: Invalid input');
        return res.status(400).redirect('back');
    }
});

// Route to send a report to the specified receiver, and stores the report information into the reports table
router.post('/report', (req, res) => {
    if (!req.body.issue || !req.body.fact?.id) {
        req.flash(
            'error',
            'There was an error submitting your report. Please try again.'
        );
        return res.status(500).redirect('back');
    }

    // Set all required data to variables
    const reporter = res.locals.user?.id || 'zzz3737';
    const factID = req.body.fact.id;
    const factContent = req.body.fact?.content || 'Unknown';
    const reportContent = req.body.issue.trim();
    
    // Set the mail configurations
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        subject: 'thirty-seven.org - Fact #' + factID + ' Has Been Reported',
        html:
            `<!doctype html>
            <html>
            <body style="width: 100%; font-family: Arial, Helvetica, sans-serif;">
                <div style="max-width: fit-content; margin: 0 auto; padding: 1rem; background-color: #DEDEDE; border-radius: 2rem;">
                    <p style="padding: 0.25rem; margin: 0; font-size: 3rem; font-weight: bold; border-bottom: 1px solid black; color: #370370; padding: 1rem;">Factoid Report</p>
                    <p style="padding: 0.25rem; margin: 0; margin-top: 0.5rem;"><b>Fact #${factID}</b></p>
                    <p style="padding: 0.25rem; margin: 0; margin-top: 0.5rem;"><b>Fact:</b> ${factContent}</p><br>
                    <p style="padding: 0.25rem; margin: 0; margin-top: 0.5rem;"><b>Issue:</b> ${reportContent}</p>
                    <p style="padding: 0.25rem; margin: 0; margin-top: 0.5rem;"><b>Reported by:</b> ${reporter}</p>
                    <p style="padding: 0.25rem; margin: 0; margin-top: 0.5rem;"><b>Timestamp:</b> ${new Date().toUTCString()}</p>
                    <p style="padding: 0.25rem; margin: 0; margin-top: 0.5rem;"><a href="${process.env.SITE_LINK}/admin" style="display: inline-block; background-color: #370370; color: #DEDEDE; text-decoration: none; padding: 0.75rem; border-radius: 1rem;">Go to the dashboard</a> (You may need to log in to access.)</p>
                </div>
                <p style="font-style: italic; width: fit-content; margin: 0 auto; margin-top: 0.5rem">This report was sent from <a href="${process.env.SITE_LINK}">${process.env.SITE_LINK}</a></p>
            </body>
            </html>`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ', error);
        } else {
            console.log('Email sent: ', info.response);
        }
    });

    // Store the report in the database
    try {
        submitReport(factID, reporter, reportContent);
        req.flash('success', 'Report successfully sent!');
        res.redirect('back');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('back');
    }
});

// Route to resolve/delete the specified report
router.delete('/report/:reportID', rejectUnauthorizedRequest, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const reportID = parseInt(req.params.reportID);
        if (isNaN(reportID)) {
            res.status(404).json({ message: 'Invalid report ID. Cannot delete report.' });
        }
        resolveReport(reportID);
        res.status(200).json({ message: 'Report has been resolved.' });
    } catch (e) {
        res.status(500).json({ message: `Error in resolving report! ID: ${reportID}` });
    }
});


// API endpoint to delete an attachment for a given attachment ID
router.delete('/attachment/:attachmentID', rejectUnauthorizedRequest, (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        const attachmentID = parseInt(req.params.attachmentID);

		if (isNaN(attachmentID)) {
			return res.status(404).send({ message: 'Invalid attachment ID in request.' });
		}
        const result = deleteAttachmentforFactoid(attachmentID)

        if (result) {
            return res.status(200).send({ message: 'Attachment deleted successfully.' });
        } else {
            return res.status(404).send({ message: 'Attachment not found.' });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: 'Server error.' });
    }
});

// Route to add attachments to a given fact.
router.post('/attachment', 
    rejectUnauthorizedRequest, 
    upload.array('attachment'),
    uploadErrorHandler, 
    (req, res) => {
        if (!req.body.factID) return res.status(400).json({message: 'Fact ID must be provided.'})
        if (!res.locals.filenames) return res.status(400).json({message: 'No attachments provided.'})

        try {
            insertAttachments(res.locals.filenames, req.body.factID)
            return res.status(201).json({message: 'Attachments added successfully.'})
        } catch (err) {
            console.log(err)
            return res.status(400).json({message: `Unable to add attachment(s) to fact ${req.body.factID}.`})
        }
})

// API endpoint to delete a tag for a given factoid ID and category ID
router.delete('/tag/:factoidID/:categoryID', rejectUnauthorizedRequest, (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        const factoidID = parseInt(req.params.factoidID);
        const categoryID = parseInt(req.params.categoryID);

		if (isNaN(factoidID) || isNaN(categoryID)) {
			return res.status(404).send({ message: 'Invalid fact or category in request.' });
		}

        const result = deleteTagforFactoid(factoidID, categoryID);

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

// API endpoint to delete a fact and associated tags and attachments
router.delete('/fact/:factoidID', rejectUnauthorizedRequest, (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        const factoidID = parseInt(req.params.factoidID);
        
		if (isNaN(factoidID)) {
			return res.status(404).send({ message: 'Invalid factoid ID in request.' });
		}
        // Delete all attachments associated with the factoid
        const attachmentsDeleted = deleteAllAttachmentsforFactoid(factoidID);
        if (!attachmentsDeleted) {
            return res.status(500).send({ message: 'Error deleting attachments for the factoid.' });
        }

        // Delete all tags associated with the factoid
        const tagsDeleted = deleteAllTagsforFactoid(factoidID);
        if (!tagsDeleted) {
            return res.status(500).send({ message: 'Error deleting tags for the factoid.' });
        }

        // Delete the factoid itself
        const factDeleted = deleteFactByID(factoidID);
        if (factDeleted) {
            return res.status(200).send({ message: 'Fact and associated attachments/tags deleted successfully.' });
        } else {
            return res.status(404).send({ message: 'Error deleting Factoid.' });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: 'Server error.' });
    }
});

// API endpoint to approve a fact with the given id.
router.put('/approve/:factoidID', rejectUnauthorizedRequest, (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        const factoidID = parseInt(req.params.factoidID);
        
		if (isNaN(factoidID)) {
			return res.status(404).send({ message: 'Invalid factoid ID in request.' });
		}
        const approved = approveFactByID(factoidID)
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