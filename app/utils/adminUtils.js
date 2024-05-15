module.exports.isAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        res.redirect('/');
    } else {
        next();
    }
}