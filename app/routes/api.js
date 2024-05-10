/**
 * Fact API Routes.
 */
const db = require('better-sqlite3')('app.db')
const express = require('express')
const router = express.Router()

// API endpoint to get all facts that fulfill the given condition(s).
// Accepts query param 'tag' for filtering by tag. Can be given multiple tag arguments for finer filtering.
router.get('/api/fact', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        let facts = getFacts(req.query.tag)
        let publicFieldFacts = facts.map(fact => {
            let { is_approved, approval_date, ...publicFields } = fact
            return publicFields
        })
        return res.status(200).send(publicFieldFacts)
    } catch (e) {
        console.log(e)
        return res.status(500).send({ message: "Server error." })
    }
})

// API endpoint to get the fact with the given id.
router.get('/api/fact/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        let id = parseInt(req.params.id)
        if (isNaN(id)) { return res.status(400).send({ message: "Fact ID is not of the correct format." }) }
        let fact = getFactByID(id)
        if (fact) {
            let { is_approved, approval_date, ...publicFields } = fact
            return res.status(200).send(publicFields)
        } else {
            return res.status(404).send({ message: "Fact not found." })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({ message: "Server error." })
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

/**
 * Given a list of tags, returns facts filtering out those who do not have all the given tags.
 * @param {*} tags a list of tag strings
 * @returns a list of facts whose tags are a superset of the input tags 
 */

function getFacts(tags = undefined) {
    if (tags) {
        let getFactsStmt = db.prepare(`
                SELECT 
                    *, group_concat(name) as taglist
                FROM (
                    factoid JOIN (
                        tag JOIN category
                        ON tag.category_id = category.id
                    )
                    ON factoid.id = tag.factoid_id
                )
                WHERE is_approved
                GROUP BY factoid.id         
            `)
        let unfilteredFacts = getFactsStmt.all()
        return unfilteredFacts.filter(fact => {
            let tagsArray = fact.taglist.split(',')
            return tags.every(tag => {
                return tagsArray.includes(tag)
            })
        })
    } else {
        let getFactsStmt = db.prepare('SELECT * FROM factoid WHERE is_approved')
        return getFactsStmt.all()
    }
}


module.exports = { router, getFactByID }