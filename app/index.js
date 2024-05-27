/**
 * This is the main server entrypoint and contains routing, middleware, and
 * route handlers to use for each. The application is built primarily using EJS
 * templates to serve website content.
 *
 * @author Alex Sichitiu
 * @author Dakaro Mueller
 * @author Justin Ng
 * @author Liana Diu
 * @author Elijah Fabon
 */
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const path = require('path');

const authRouter = require('./routes/auth');
const clientRouter = require('./routes/client');
const apiRouter = require('./routes/api');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const SQLiteStore = require('connect-sqlite3')(session);

const swaggerUI = require('swagger-ui-express');
const yaml = require('yaml');
const fs = require('fs');

const { setUserDataLocals, fetchPrimaryTags } = require('./middleware');

const backupTimer = require('./modules/backupTimer')
backupTimer.start()

// ================ SERVER SETUP ================
app.set('view engine', 'ejs'); // Config express to use ejs as the "view engine" (See: https://expressjs.com/en/guide/using-template-engines.html)
app.set('views', './app/views'); // Config to use the views from our app dir

if (process.env.BEHIND_PROXY) {
    // Configures the app to trust proxy forwarding headers. (See: https://expressjs.com/en/resources/middleware/session.html#cookiesecure)
    app.set('trust proxy', 1);
}

// Initialize the SQLite database if INIT_DATABASE is set.
if (process.env.INIT_DATABASE) {
    require('../db/configDB');
}

app.use(
    session({
        cookie: {
            maxAge: 2 * 60 * 60 * 1000,
            secure: !(process.env.HTTPS_ENABLED === 'false'),
        },
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new SQLiteStore({ db: 'app.db' }),
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Use passport as authentication middleware
app.use(passport.authenticate('session'));
// Middleware used to 'flash' temporary messages back to the user (e.g. Error messages, warnings).
app.use(flash());
// Middleware used to allow forms to use methods other than exclusively POST/GET through a query parameter.
app.use(methodOverride('_method'));
// Middleware to make user data available to EJS on all pages.
app.use(setUserDataLocals);
// Middleware to make categories available throughout the application
app.use(fetchPrimaryTags);

// Configuring API docs via Swagger.
const swaggerFile = fs.readFileSync('./swagger.yaml', 'utf-8');
const swaggerDoc = yaml.parse(swaggerFile);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// ================ ROUTERS ========================
app.use('/', authRouter, clientRouter);
app.use('/api', apiRouter);

// ================ STATIC PATH SETUP ================
app.use('/', express.static(path.join(__dirname, 'public')));

// Begin the server and listen on the configured port
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
