/**
 * Client API Routes.
 */
const express = require('express');
const router = express.Router();
const { readCountryData } = require('../modules/countryUtils');
const { getFacts, getRandomFact, getUnapprovedFacts, getFactByID } = require('../handlers/factoid');
const { redirectUnauthorizedRequestHome } = require('../middleware');
const { getTags } = require('../handlers/tag');
const { getReports } = require('../handlers/report');

router.get('/', (req, res) => {
    pageContext = prepForFactList(req);
    pageContext.factoid = getRandomFact();
    res.render('pages/landing-page', pageContext);
});

// This route is for the admin dashboard where the admin can routerroved, edit, and delete fact submissions.
router.get('/admin', redirectUnauthorizedRequestHome, (req, res) => {
    const getTagNames = (fact) => {
        fact.tags = fact.tags?.map(tag => tag.name);
        return fact;
    }
    const unapprovedFacts = getUnapprovedFacts().map(getTagNames);
    const allReports = getReports();
    const tags = getTags();
    res.render('pages/admin-dashboard', { submissions: unapprovedFacts, reports: allReports, tags: tags });
});

// route for submitting facts
router.get('/submit', (req, res) => {
    const tags = getTags();
    if (!req.user) {
        // gets country data from json for fact submitter country options
        res.render('pages/fact-submission-page', { countries: readCountryData(), tags: tags });
    } else {
        res.render('pages/fact-submission-page', { user: req.user, tags: tags });
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

// Route to edit a fact
router.get('/edit-fact/:id', redirectUnauthorizedRequestHome, (req, res) => {
    const factID = req.params.id;
    const factoid = getFactByID(factID, false); 
    const tags = getTags();

    if (!factoid) {
        return res.status(404).send('Fact not found');
    }

    res.render('pages/edit-fact', { factoid, user: req.user, countries: readCountryData(), tags });
});

/**
 * Returns an object with properties necessary to render fact-list.ejs. Can modify an existing object via the pageContext arg or return a new one if pageContext is undefined.
 * @param {*} req Request
 * @param {*} pageContext Optional pageContext object to be modified with necessary properties.
 * @returns object with necessary properties to render fact-list.ejs.
 */
function prepForFactList(req, pageContext = {}) {
    pageNum = parseInt(req.query.pageNum) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const retrieveApproved = req.user?.isAdmin ? null : true; // Pass null to retrieve all facts if user is an administrator.
    let factoids = getFacts(retrieveApproved, req.query.tag, req.query.searchText, pageNum, pageSize);
    
    // Extract non-public fields if unauthorized/non-admin user.
    if (!req.user?.isAdmin) {
        factoids = factoids.map((fact) => {
            let { is_approved, approval_date, ...publicFields } = fact;
            return publicFields;
        });
    }

    maxPages = Math.ceil(getFacts(retrieveApproved, req.query.tag, req.query.searchText).length / pageSize);
    
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
