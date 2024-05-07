const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();
const passport = require('passport')
const LocalStrategy = require('passport-local')

// Configuring passport strategy.
passport.use(new LocalStrategy(async function verify(email, password, done) {
    let user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    console.log(user)
    if (!user) return done(null, false, { message: 'Incorrect login credentials.' })

    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
        if (err) return done(err)
        if (!crypto.timingSafeEqual(user.hashed_password, hashedPassword)) {
            return done(null, false, { message: 'Incorrect login credentials.' });
        }

        return done(null, user)
    })
}))

// Serialization Functions
passport.serializeUser(function (user, done) {
    process.nextTick(function () {
        done(null, { id: user.id, email: user.email });
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
    if (req.query.err) error = `Error: ${req.query.err}`
    if (req.user) error = `You're already logged in as ${req.user.id}` 
    res.render('pages/login', { err: error })
})

// API route to log a user in.
router.post('/login', passport.authenticate('local', {
    successRedirect: '/account',
    failureRedirect: '/login?err=loginfailed'
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
    }
    res.render('pages/signup', { err: error })
})

// API route to sign a new user up.
router.post('/signup', (req, res, next) => {
    let salt = crypto.randomBytes(16)
    let user
    let attemptsLeft = 10000
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
        if (err) { res.redirect('/signup?error=other') }
        while (true) {
            try {
                user = await prisma.user.create({
                    data: {
                        id: generateRandomUID(),
                        email: req.body.email,
                        hashed_password: hashedPassword,
                        salt: salt
                    }
                })
            } catch (err) {
                console.log(err)
                if (err instanceof PrismaClientKnownRequestError && err.code === "P2002" && err.meta.target[0] === 'id' && attemptsLeft <= 0) {
                    attemptsLeft--
                    continue
                } else {
                    return res.redirect(`/signup?error=${attemptsLeft <= 0 ? 'other' : 'email'}`)
                }
            }
            break
        }

        console.log(user)
        req.login(user, (err) => {
            if (err) return next(err)
            res.redirect('/')
        })
    })
})

// API route to log a user out.
router.post('/logout', function (req, res, next) {
    console.log('signing out')
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

/**
 * Generates a random user id where the first 3 chars are random lowercase alphabet letters and the last 4 chars are a zero-padded multiple of 37.
 * @returns string containing the random user id
 */
function generateRandomUID() {
    let userid = ""
    let upperLimit = 9999
    let prefixLength = 3

    for (let i = 0; i < prefixLength; i++) {
        let n = Math.floor(Math.random() * 26)
        userid += String.fromCharCode(97 + n)
    }

    let factor = Math.floor(Math.random() * upperLimit / 37)
    userid += String(factor).padStart(4, '0')

    return userid
}

module.exports = router