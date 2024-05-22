/**
 * Client API Routes.
 */
const express = require('express');
const router = express.Router();
const countryUtils = require('../utils/countryUtils');
const { redirectUnauthorizedRequestHome } = require('../middleware');
const { getFacts, getRandomFact } = require('../handlers/factoid');
const { getTags } = require('../handlers/tag')

const PAGE_SIZE = 5

router.get('/', (req, res) => {
    pageContext = prepForFactList(req)
    pageContext.factoid = getRandomFact()
    res.render('pages/landing-page', pageContext);
});

// This route is for the admin dashboard where the admin can routerroved, edit, and delete fact submissions.
router.get('/admin', redirectUnauthorizedRequestHome, (req, res) => {
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
    pageContext = prepForFactList(req)
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

// Test path for uploading files.
router.get('/upload', (req, res) => {
    res.render('pages/upload')
})

/**
 * Returns an object with properties necessary to render fact-list.ejs. Can modify an existing object via the pageContext arg or return a new one if pageContext is undefined.
 * @param {*} req Request
 * @param {*} pageContext Optional pageContext object to be modified with necessary properties.
 * @returns object with necessary properties to render fact-list.ejs.
 */
function prepForFactList(req, pageContext = {}) {
    pageNum = req.query.pageNum && req.query.pageNum > 0 ? req.query.pageNum : 1

    let factoids = getFacts(req.query.tag, req.query.searchText, pageNum, PAGE_SIZE).map((fact) => {
        let { is_approved, approval_date, ...publicFields } = fact;
        return publicFields;
    });

    maxPages = Math.ceil(getFacts(req.query.tag, req.query.searchText).length / PAGE_SIZE)
    
    pageContext.factoids = factoids, 
    pageContext.tags = getTags(), 
    pageContext.searchText = req.query.searchText
    pageContext.activeTags = req.query.tag || [],
    pageContext.isAdmin = req.user ? req.user.isAdmin : false,
    pageContext.pageNum = pageNum,
    pageContext.maxPages = maxPages
    
    return pageContext
}

module.exports = router;
