const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const db = require('better-sqlite3')('app.db')
const { SqliteError } = require('better-sqlite3')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const passwordValidator = require('password-validator')
const emailValidator = require('email-validator')
const middleware = require('../middleware')

// Configuring passport strategy.
passport.use(new LocalStrategy(async function verify(email, password, done) {
    try {
        let getUserStmt = db.prepare("SELECT * FROM user WHERE email = ?")
        let user = getUserStmt.get(email)
        if (!user) return done(null, false, { message: 'Incorrect login credentials.' })
    
        crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
            if (err) return done(err)
            if (!crypto.timingSafeEqual(user.hashed_password, hashedPassword)) {
                return done(null, false, { message: 'Incorrect login credentials.' });
            }
    
            return done(null, user)
        })
    } catch (e) {
        console.log(e)
        return done(null, false, {message: 'Server error.'})
    }
    
}))

// Serialization Functions
passport.serializeUser(function (user, done) {
    process.nextTick(function () {
        done(null, { id: user.id, email: user.email, fname: user.fname, lname: user.lname, isAdmin: user.is_admin });
    })
});

passport.deserializeUser(function (user, done) {
    process.nextTick(function () {
        return done(null, user);
    })
});



// Route for log in page.
router.get('/login', (req, res, next) => {
    let error
    if (req.query.error && req.session && req.session.messages) {
        error = req.session.messages.pop()
    }
    if (req.user) error = `You're already logged in as ${req.user.id}`
    res.render('pages/login', { err: error })
})

// API route to log a user in.
router.post('/api/login', passport.authenticate('local', {
    successRedirect: '/account',
    failureRedirect: '/login?error=true',
    failureMessage: true
}))

// Route for sign up page.
router.get('/signup', (req, res, next) => {
    let error
    switch (req.query.error) {
        case "email":
            error = "Email is already in use."
            break
        case "other":
            error = "Error occurred, please try again at another time."
            break
        case "invalid-email":
            error = "Email is invalid."
            break
        case "invalid-password":
            error = "Password is invalid"
            break
    }
    res.render('pages/signup', { err: error })
})

// API route to sign a new user up.
router.post('/api/signup', (req, res, next) => {
    let salt = crypto.randomBytes(16)
    let user
    let attemptsLeft = 10000

    let passwordSchema = new passwordValidator()
        .is().min(8)
        .is().max(100)
        .has().not().spaces()
        .has().digits(1)
        .has().letters(1)
    
    if (!passwordSchema.validate(req.body.password)) return res.redirect('/signup?error=invalid-password')
    if (!emailValidator.validate(req.body.email)) return res.redirect('/signup?error=invalid-email')
    if (req.body.fname) req.body.fname = req.body.fname.trim()
    if (req.body.lname) req.body.lname = req.body.lname.trim()

    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
        if (err) { res.redirect('/signup?error=other') }
        while (true) {
            try {
                let insertNewUserStmt = db.prepare('INSERT INTO user (id, email, hashed_password, salt, fname, lname) VALUES (?, ?, ?, ?, ?, ?) RETURNING *')
                user = insertNewUserStmt.get(generateRandomUID(), req.body.email, hashedPassword, salt, req.body.fname, req.body.lname)

            } catch (err) {
                console.log(err)
                if (err instanceof SqliteError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' && attemptsLeft > 0) {
                    attemptsLeft--
                    continue
                } else {
                    return res.redirect(`/signup?error=${attemptsLeft <= 0 ? 'other' : 'email'}`)
                }
            }
            break
        }

        req.login(user, (err) => {
            if (err) return next(err)
            res.redirect('/')
        })
    })
})

// API route to log a user out.
router.post('/api/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        let url = req.header('Referer') || '/'
        res.redirect(url);
    });
});

// Route for seeing user account data.
router.get('/account', middleware.isLoggedIn, (req, res) => {
    res.render('pages/account')
})

/**
 * Generates a random user id where the first 3 chars are random lowercase alphabet letters and the last 4 chars are a zero-padded multiple of 37.
 * @returns string containing the random user id
 */
function generateRandomUID() {
    let userid = []
    let upperLimit = 9999
    let prefixLength = 3

    for (let i = 0; i < prefixLength; i++) {
        let n = Math.floor(Math.random() * 26)
        userid.push(String.fromCharCode(97 + n))
    }

    let factor = Math.floor(Math.random() * Math.floor(upperLimit / 37)) + 1
    userid.push(String(factor * 37).padStart(4, '0'))

    return userid.join("")
}

// Unit Testing for UID Generation
// for (let i = 0; i < 10000; i++) {
//     let uid = generateRandomUID()
//     console.assert(uid.length == 7, "UID is not 7 char long.")
//     let multipleOf37 = parseInt(uid.substring(3))
//     console.assert(multipleOf37 % 37 == 0, "Number postfix is not a multiple of 37")
//     console.assert(multipleOf37 != 0, "Number postfix is 0000")
// }


module.exports = router