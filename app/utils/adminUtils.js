function isAdmin(req, res, next) {
    if (!req.user?.isAdmin) {
        res.redirect('/');
    } else {
        next();
    }
}

module.exports = {
    isAdmin,
};
