/**
 * Fact API Routes.
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const router = express.Router()

// API endpoint to get all facts that fulfill the given condition(s).
router.get('/api/fact', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        prisma.factoid.findMany({
            where: {
                is_approved: true
            }
        })
            .then((facts) => {
                let publicFieldFacts = facts.map(fact => {
                    let {is_approved, approval_date, ...publicFields} = fact
                    return publicFields
                }) 
                return res.status(200).send(publicFieldFacts)
            })
    } catch (e) {
        console.log(e)
        return res.status(500).send( { message: "Server error." } )
    }
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
                id: id,
                is_approved: true
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