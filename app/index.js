/**
 * This is the main server entrypoint and contains routing, middleware, and
 * route handlers to use for each. The application is built primarily using EJS
 * templates to serve website content.
 *
 * @author Alex Sichitiu
 * @author Dakaro Mueller
 */
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authRouter = require('./routes/auth')

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

app.use('/', authRouter)

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

// ================ SERVER ROUTES ================
// TODO: Add server REST route calls for making SQLite queries through prisma

// Begin the server and listen on the configured port
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
