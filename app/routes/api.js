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
        return res.status(200).send(JSON.stringify(publicFieldFacts))
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
            let { is_approved, approval_date, cat_id, ...publicFields } = fact
            return res.status(200).send(JSON.stringify(publicFields))
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
 * @returns Fact with the corresponding id and associated tags and attachments. Undefined if the id is not associated with any fact or is invalid.
 */
function getFactByID(factID) {
    try {
        let id = parseInt(factID)
        let fact, tags, attachments

        let fetch = db.transaction((id) => {
            let getFactStmt = db.prepare(`SELECT * FROM factoid WHERE id = ?`)
            fact = getFactStmt.get(id)
    
            let getTagsStmt = db.prepare(`SELECT * FROM (tag JOIN category on category_id = category.id) WHERE factoid_id = ?`)
            tags = getTagsStmt.get(id)
    
            let getAttachmentsStmt = db.prepare(`SELECT * FROM attachment WHERE factoid_id = ?`)
            attachments = getAttachmentsStmt.get(id)
        })
        fetch(id)

        fact.tags = tags
        fact.attachments = attachments
        return fact
    } catch (e) {
        console.log(e)
        return undefined
    }
}

/**
 * Given a list of tags, returns facts filtering out those who do not have all the given tags.
 * @param {*} tags a list of tag strings
 * @returns a list of facts with associated tags and attachments whose tags are a superset of the input tags. Returns empty list if error occurs.
 */
function getFacts(tags = undefined) {
    try {
        let getFactsStmt = db.prepare(`
        SELECT 
            id, 
            group_concat(name) as taglist
        FROM (
            SELECT 
                fulltag.id as cat_id, * 
            FROM
                factoid LEFT JOIN 
                    (tag JOIN category
                    ON tag.category_id = category.id
                    ) as fulltag
                ON factoid.id = factoid_id
        )
        WHERE is_approved
        GROUP BY id         
        `)
        let unfilteredFacts = getFactsStmt.all()
        unfilteredFacts.forEach(fact => {
            fact.taglist = fact.taglist ? fact.taglist.split(',').sort() : []
        })
    
        let filteredFacts = filterFacts(unfilteredFacts, tags)

        return filteredFacts.map(fact => {
            return getFactByID(fact.id)
        })
    } catch (e) {
        console.log(e)
        return []
    }
}

/**
 * Filters a list of facts by their tags. Returned facts have tags that are a superset of the given tags.
 * @param {*} facts a list of facts to be filtered.
 * @param {*} tags a list of tags to filter with.
 * @returns a filtered list of facts.
 */
function filterFacts(facts, tags = []) {
    tags = !Array.isArray(tags) ? [tags] : tags
    return facts.filter(fact => {
        return tags.every(tag => {
            return fact.taglist.includes(tag)
        })
    })
}

module.exports = { router, getFactByID, getFacts }