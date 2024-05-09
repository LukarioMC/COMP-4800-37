const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const router = express.Router()

router.get('/api/fact', (req, res, next) => {
})

// API endpoint to get the fact with the given id.
router.get('/api/fact/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.status(400).send( {message: "Fact ID is not of the correct format."} )
        }
        prisma.factoid.findUnique({
            where: {
                id: id
            }
        })
        .then((fact) => {
            if (fact) { 
                let {is_approved, approval_date, ...publicFields} = fact
                return res.status(200).send(publicFields) 
            } else { 
                return res.status(404).send( {message: "Fact not found."} )
            }
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send( { message: "Server error." } )
    }
})

module.exports = router