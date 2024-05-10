/**
 * This is the main server entrypoint and contains routing, middleware, and
 * route handlers to use for each. The application is built primarily using EJS
 * templates to serve website content.
 *
 * @author Alex Sichitiu
 * @author Dakaro Mueller
 * @author Justin Ng
 * @author Elijah Fabon
 */
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const path = require('path');
const flash = require('connect-flash');

const authRouter = require('./routes/auth')
const passport = require('passport')
const session = require('express-session')

const db = require('better-sqlite3')('app.db')
const SQLiteStore = require('connect-sqlite3')(session)

// ================ SERVER SETUP ================
app.set('view engine', 'ejs'); // Config express to use ejs as the "view engine" (See: https://expressjs.com/en/guide/using-template-engines.html)
app.set('views', './app/views'); // Config to use the views from our app dir

app.use(session({
    cookie: { 
        maxAge: 2 * 60 * 60 * 1000,
        secure: !(process.env.HTTPS_ENABLED === "false")
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({db: 'app.db'})
}))
app.use(express.urlencoded({extended: true}));
app.use(passport.authenticate('session'));

// Middleware to make user data available to EJS on all pages.
app.use(function (req, res, next) {
    res.locals.user = req.user ? {id: req.user.id, email: req.user.email, fname: req.user.fname, lname: req.user.lname} : undefined
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

// This route is for the factoids listings page where users can view and search for factoids.
app.get('/factoids', async (req, res) => {
    const pageContext = {
        // Fake Fact data to mock factoid, may be replaced with actual data from the database
        factoid: {
            id: 777,
            content: 'A super cool 37 fact',
            note: 'Something extra about the fact',
        },
    };
    res.render('pages/factoid-listings', pageContext);
});

// This route is for the about/why 37? page.
app.get('/about', async (req, res) => {
    res.render('pages/about');
});

// This route displays contact information
app.get('/contact', (req, res) => {
    res.render('pages/contact');
});

// ================ SERVER ROUTES ================
// TODO: Add server REST route calls for making SQLite queries through prisma
// ----- FACTS -----
// POST /api/fact: [API] Add new fact + attachments to be approved 
app.post('/api/fact', (req, res) => {

});

// ----- ADMIN -----
// PUT /api/fact: [API] Update/edit a facts contents
app.put('/api/fact', (req, res) => {

});

// Begin the server and listen on the configured port
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
