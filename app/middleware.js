/**
 * Contains custom Express middleware functions.
 */

const { getPrimaryTags } = require('./handlers/tag')

/**
 * Middleware that will redirect users to login page if they are not logged in.
 * @param {Express.Request} req Incoming request object
 * @param {Express.Response} res Outgoing response object
 * @param {Express.RequestHandler} next Next request handler in request chain
 */
function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/login');
}

/**
 * Middleware that will redirect users back to the landing/home page if they are unauthorized (non-administrator)
 * @param {Express.Request} req Incoming request object
 * @param {Express.Response} res Outgoing response object
 * @param {Express.RequestHandler} next Next request handler in request chain
 */
function redirectUnauthorizedRequestHome(req, res, next) {
    if (!req.user?.isAdmin) {
        res.redirect('/');
    } else {
        next();
    }
}

/**
 * Middleware that will reject users requests with a 403 status and JSON response if they are unauthorized (non-administrator)
 * @param {Express.Request} req Incoming request object
 * @param {Express.Response} res Outgoing response object
 * @param {Express.RequestHandler} next Next request handler in request chain
 */
function rejectUnauthorizedRequest(req, res, next) {
    if (!req.user?.isAdmin) {
        res.status(403).json({
            message: 'You must be an administrator to perform this action.',
        });
    } else {
        next();
    }
}

function fetchPrimaryTags(req, res, next) {
    try {
        const primaryTags = getPrimaryTags();
        res.locals.primaryTags = primaryTags;
        next();
    } catch (err) {
        console.error('Error fetching primary tags:', err);
        res.locals.primaryTags = [];
        next();
    }
}

module.exports = {
    redirectUnauthorizedRequestHome,
    rejectUnauthorizedRequest,
    isLoggedIn,
    fetchPrimaryTags,
};
