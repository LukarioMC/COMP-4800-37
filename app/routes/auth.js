const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();
const passport = require('passport')
const LocalStrategy = require('passport-local')

passport.use(new LocalStrategy(async function verify(email, password, done) {
    let user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
        if (err) return done(err)
        if (!user) return done(null, false, {message: 'Incorrect login credentials.'})

        if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, {message: 'Incorrect login credentials.'})
        }

        return done(null, user)
    })
}))

passport.serializeUser(function(user, done) {
    process.nextTick(function() {
      done(null, { id: user.id, username: user.username });
    });
  });
  
  passport.deserializeUser(function(user, done) {
    process.nextTick(function() {
      return done(null, user);
    });
  });

router.get('/login', (req, res, next) => res.render('pages/login'))

router.get('/signup', (req, res, next) => res.render('pages/signup'))

router.post('/signup',  (req, res, next) => {
    let salt = crypto.randomBytes(16)
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
        if (err) {res.redirect('/signup?failed=true')}
        while (true) {
            try {
                await prisma.user.create({
                    id: generateRandomUID(),
                    email: req.body.email,
                    hashed_password: hashedPassword,
                    salt: salt
                })
            } catch (err) {
                if (err instanceof PrismaClientKnownRequestError && err.code === "P2002" && err.meta.target[0] === 'id') {
                    continue
                } else {
                    return res.redirect('/f')
                }
            }
            break
        }

        req.login(user, (err) => {
            if (err) res.redirect('/f')
            else res.redirect('/')
        })
    })
})

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

