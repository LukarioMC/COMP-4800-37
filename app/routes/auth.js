const express = require('express')
const router = express.Router()

router.get('/login', (req, res, next) => res.render('pages/login'))

router.get('/signup', (req, res, next) => res.render('pages/signup'))

module.exports = router