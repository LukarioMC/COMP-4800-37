/**
 * Client API Routes.
 */
const express = require('express');
const router = express.Router();
const countryUtils = require('../utils/countryUtils');
const { getFacts, getRandomFact, getUnapprovedFacts } = require('../handlers/factoid');
const { redirectUnauthorizedRequestHome } = require('../middleware');
const { getTags } = require('../handlers/tag')

const PAGE_SIZE = 5

router.get('/', (req, res) => {
    pageContext = prepForFactList(req);
    pageContext.factoid = getRandomFact();
    res.render('pages/landing-page', pageContext);
});

// This route is for the admin dashboard where the admin can routerroved, edit, and delete fact submissions.
router.get('/admin', redirectUnauthorizedRequestHome, (req, res) => {
        const unapprovedFacts = getUnapprovedFacts();
        const tags = getTags();
        res.render('pages/admin-dashboard', { submissions: unapprovedFacts, tags: tags });

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

/**
 * Returns an object with properties necessary to render fact-list.ejs. Can modify an existing object via the pageContext arg or return a new one if pageContext is undefined.
 * @param {*} req Request
 * @param {*} pageContext Optional pageContext object to be modified with necessary properties.
 * @returns object with necessary properties to render fact-list.ejs.
 */
function prepForFactList(req, pageContext = {}) {
    pageNum = req.query.pageNum && req.query.pageNum > 0 ? req.query.pageNum : 1

    let factoids = getFacts(req.query.tag, req.query.searchText, pageNum, PAGE_SIZE, !req.user?.isAdmin)
    
    // Extract non-public fields if unauthorized/non-admin user.
    if (!req.user?.isAdmin) {
        factoids = factoids.map((fact) => {
            let { is_approved, approval_date, ...publicFields } = fact;
            return publicFields;
        });
    }

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
