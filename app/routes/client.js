/**
 * Client API Routes.
 */
const express = require('express');
const router = express.Router();
const countryUtils = require('../utils/countryUtils');
const flash = require('connect-flash');
const { getFacts, getRandomFact } = require('../handlers/factoid');
const { getTags } = require('../handlers/tag')

router.get('/', (_, res) => {
    const pageContext = {
        factoid: getRandomFact()
    };
    res.render('pages/landing-page', pageContext);
});

// This route is for the admin dashboard where the admin can routerroved, edit, and delete fact submissions.
router.get('/admin', (req, res) => {
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
    const adminName = 'mag3737';
    res.render('pages/admin-dashboard', { submissions: testData, adminName });
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
router.get('/facts', async (req, res) => {
    let factoids = getFacts(req.query.tag, req.query.searchText).map((fact) => {
        let { is_approved, approval_date, ...publicFields } = fact;
        return publicFields;
    });

    let pageContext = {
        factoids: factoids, tags: getTags(), 
        activeTags: req.query.tag || [],
        isAdmin: req.user ? req.user.isAdmin : false
    }
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
