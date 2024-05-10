const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '37 Fact API',
            description: "API endpoints for facts about the number 37",
            contact: {
                name: "Thomas Magliery",
                email: "info@miniblog.com"
            },
            version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:8000/",
                description: "Local server"
            },
            {
                url: "<your live url here>",
                description: "Live server"
            },
        ]
    },
    // looks for configuration in specified directories
    apis: ['./app/routes/*.js', './app/*.js'],
}

const swaggerSpec = swaggerJSDoc(options)
function swaggerDocs(app) {
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })
}

module.exports = swaggerDocs