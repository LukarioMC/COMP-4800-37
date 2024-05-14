module.exports.isAdmin = (user) => {
    if (!user.isAdmin) {
        return false;
    }
    return true;
}