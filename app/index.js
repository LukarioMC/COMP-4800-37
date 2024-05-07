/**
 * This is the main server entrypoint and contains routing, middleware, and
 * route handlers to use for each. The application is built primarily using EJS
 * templates to serve website content.
 *
 * @author Alex Sichitiu
 * @author Dakaro Mueller
 * @author Justin Ng
 */
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const path = require('path');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authRouter = require('./routes/auth')
const passport = require('passport')
const session = require('express-session')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const bodyParser = require('body-parser');

// Example Prisma queries.
// prisma.user.create({
//     data: {
//         id: 'aaa0037',
//         email: 'test',
//         hashed_password: 'test'
//     }
// })
//     .catch(console.log)
//     .then(_res => {return prisma.user.findMany()})
//     .then(console.log)

// ================ SERVER SETUP ================
app.set('view engine', 'ejs'); // Config express to use ejs as the "view engine" (See: https://expressjs.com/en/guide/using-template-engines.html)
app.set('views', './app/views'); // Config to use the views from our app dir

app.use(session({
    cookie: { maxAge: 2 * 60 * 60 * 1000 },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        prisma,
        {
            checkPeriod: 2 * 60 * 1000,  //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.authenticate('session'));

app.use(function (req, res, next) {
    res.locals.user = req.user ? {id: req.user.id, email: req.user.email} : undefined
    next();
});

// ================ ROUTERS ========================
app.use('/', authRouter)

// ================ JS AND CSS PATH SETUP ================
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/js')));

// ================ APP ROUTES ================
app.get('/', (_, res) => {
    const pageContext = {
        // Fake Fact data to mock landing page fact of the day, may be replaced with random fact?
        factoid: {
            id: 123,
            content: 'A super cool 37 fact',
            // note: 'Something extra about the fact',
        },
    };
    res.render('pages/landing-page', pageContext);
});

// * This route is used for example EJS usage demonstration. Should be removed after we are familiar with EJS.
app.get('/example', (_, res) => {
    // Demonstrating passing an obj with values to a rendered template
    const pageContext = { injectedVal: 'Superb!' };
    res.render('pages/example', pageContext);
});

// Route for seeing user account data.
app.get('/account', (req, res) => {
    res.render('pages/account')
})

// This route is for the admin dashboard where the admin can approved, edit, and delete fact submissions.
app.get('/admin', (req, res) => {
    const testData = [
        {
            dateSubmitted: '05 / 04 / 2024',
            user: 'abc0185',
            fact: 'The number of pages in this book is a multiple of 37!',
            note: 'Name of the book: "All things 37" by Greg Jones',
            tags: 'media, books',
        },
        {
            dateSubmitted: '05 / 06 / 2024',
            user: 'mag3737',
            fact: 'Another super cool 37 fact',
            note: 'Found in Vancouver, BC',
            tags: 'nature',
        },
    ];
    const adminName = 'mag3737';
    res.render('pages/admin-dashboard', { submissions: testData, adminName });
});

// ================ SERVER ROUTES ================
// TODO: Add server REST route calls for making SQLite queries through prisma

// Begin the server and listen on the configured port
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
