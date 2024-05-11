/**
 * Contains custom Express middleware functions.
 */

// Redirects user to login page if they are not logged in.
function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/login');
}

module.exports = { isLoggedIn };
