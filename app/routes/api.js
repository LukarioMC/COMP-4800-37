/**
 * Fact API Routes.
 */
const db = require('better-sqlite3')('app.db')
const express = require('express')
const router = express.Router()

// API endpoint to get all facts that fulfill the given condition(s).
router.get('/api/fact', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    let list = ["Cat A"]
    try {
        // let cond = {
        //     where: {
        //         is_approved: true,
        //         tags: {
                    
        //         }
        //     }
        // }

        // prisma.factoid.findMany(cond)
        //     .then((facts) => {
        //         let publicFieldFacts = facts.map(fact => {
        //             let {is_approved, approval_date, ...publicFields} = fact
        //             return publicFields
        //         }) 
        //         return res.status(200).send(publicFieldFacts)
        //     })
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
        if (isNaN(id)) { return res.status(400).send( {message: "Fact ID is not of the correct format."} ) }
        let fact = getFactByID(id)
            if (fact) { 
                let {is_approved, approval_date, ...publicFields} = fact
                return res.status(200).send(publicFields) 
            } else { 
                return res.status(404).send( {message: "Fact not found."} )
            }
    } catch (e) {
        console.log(e)
        return res.status(500).send( { message: "Server error." } )
    }
})

/**
 * Given an id, returns the associated fact.
 * @param {number} factID An integer representing a fact ID.
 * @returns Fact object with the corresponding id. Undefined if the id is not associated with any fact or is invalid.
 */
function getFactByID(factID) {
    try {
        let id = parseInt(factID)
        let getFactStmt = db.prepare('SELECT * FROM factoid WHERE id = ? AND is_approved')
        return getFactStmt.get(id)
    } catch (e) {
        return undefined
    }
}

module.exports = {router, getFactByID}