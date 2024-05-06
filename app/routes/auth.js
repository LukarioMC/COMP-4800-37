const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();

router.get('/login', (req, res, next) => res.render('pages/login'))

router.get('/signup', (req, res, next) => res.render('pages/signup'))

router.post('/signup',  (req, res, next) => {
    let salt = crypto.randomBytes(16)
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashed_password) {
        if (err) {res.redirect('/signup?failed=true')}
        while (true) {
            try {
                await prisma.user.create({
                    id: generateRandomUID(),
                    email: req.body.email,
                    hashed_password: hashed_password,
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

