/**
 * Client API Routes.
 */
const express = require('express');
const router = express.Router();
const countryUtils = require('../utils/countryUtils');
const adminUtils = require('../utils/adminUtils');

router.get('/', (_, res) => {
    const pageContext = {
        // Fake Fact data to mock landing page fact of the day, may be replaced with random fact?
        factoid: {
            id: 123,
            content: 'A super cool 37 fact',
            // note: 'Something extra about the fact',
        },
    };
    res.render('pages/landing-page', pageContext);
});

// This route is for the admin dashboard where the admin can routerroved, edit, and delete fact submissions.
router.get('/admin', (req, res) => {
    if (adminUtils.isAdmin(req.user)) {
        const testData = [
            {
                dateSubmitted: '05 / 04 / 2024',
                user: 'abc0185',
                fact: 'The number of pages in this book is a multiple of 37!',
                note: 'Name of the book: "All things 37" by Greg Jones',
                tags: 'media, books',
            },
            {
                dateSubmitted: '05 / 06 / 2024',
                user: 'mag3737',
                fact: 'Another super cool 37 fact',
                note: 'Found in Vancouver, BC',
                tags: 'nature',
            },
        ];
        const adminName = req.user?.id;
        res.render('pages/admin-dashboard', { submissions: testData, adminName });
    } else {
        res.redirect('/');
    }

});

// route for submitting facts
router.get('/submit', (req, res) => {
    if (!req.user) {
        // gets country data from json for fact submitter country options
        countryUtils.readCountryData((err, countries) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
            res.render('pages/fact-submission-page', { countries: countries });
        });
    } else {
        res.render('pages/fact-submission-page', { user: req.user });
    }
});

// This route is for the factoids listings page where users can view and search for factoids.
router.get('/facts', async (_, res) => {
    const pageContext = {
        // Fake Fact data to mock factoid, may be replaced with actual data from the database
        factoid: {
            id: 777,
            content: 'A super cool 37 fact',
            note: 'Something extra about the fact',
        },
    };
    res.render('pages/factoid-listings', pageContext);
});

// This route is for the about/why 37? page.
router.get('/about', async (_, res) => {
    res.render('pages/about');
});

// This route displays contact information
router.get('/contact', (_, res) => {
    res.render('pages/contact');
});

module.exports = router;
