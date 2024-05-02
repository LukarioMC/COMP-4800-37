/**
 * This is the main server entrypoint and contains routing, middleware, and
 * route handlers to use for each. The application is built primarily using EJS
 * templates to serve website content.
 *
 * @author Dakaro Mueller (A01294207)
 */
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

// ================ SERVER SETUP ================
app.set('view engine', 'ejs'); // Config express to use ejs as the "view engine"
app.set('views', './app/views'); // Config to use the views from our app dir

// ================ APP ROUTES ================
app.get('/', (_, res) => {
    // Demonstrating passing an obj with values to a rendered template
    const pageContext = { injectedVal: 'Superb!' };
    res.render('pages/landing-page', pageContext);
});

app.get('/about', (_, res) => {
    res.render('pages/about');
});

// ================ SERVER ROUTES ================
// TODO: Add server REST route calls for making SQLite queries through prisma

// Begin the server and listen on the configured port
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
