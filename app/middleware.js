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
        req.flash('error', 'You must be an administrator to perform this action.');
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

/**
 * Middleware that handles incoming upload errors and rejects with a message.
 * @param {*} err Error object, present if there are errors uploading.
 * @param {Express.Request} _req Incoming request object
 * @param {Express.Response} res Outgoing response object
 * @param {Express.RequestHandler} next Next request handler in request chain
 * @returns 
 */
const uploadErrorHandler = (err, _req, res, next) => {
    if (err) {
        return res.status(400).json({ message: err.message });
    } else {
        next();
    }
}

/**
 * Middleware that fetches primary tags and stores them in res.locals for later use.
 * If an error occurs during fetching, an empty array is stored in res.locals.
 * @param {Express.Request} req - Incoming request object.
 * @param {Express.Response} res - Outgoing response object.
 * @param {Express.RequestHandler} next - Next request handler in the request chain.
 */
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

/**
 * Middleware that extracts the currently logged in users data (such as id, name, etc.) and makes it available to all EJS template `.render` calls
 * @param {Express.Request} req _req Incoming request object
 * @param {Express.Response} res res Outgoing response object
 * @param {Express.RequestHandler} next next Next request handler in request chain
 */
function setUserDataLocals(req, res, next) {
    res.locals.user = req.user
        ? {
              id: req.user.id,
              email: req.user.email,
              fname: req.user.fname,
              lname: req.user.lname,
              isAdmin: req.user.isAdmin
          }
        : undefined;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
}

module.exports = {
    redirectUnauthorizedRequestHome,
    rejectUnauthorizedRequest,
    isLoggedIn,
    uploadErrorHandler,
    fetchPrimaryTags,
    setUserDataLocals
};
