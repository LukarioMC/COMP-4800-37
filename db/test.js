const { getFactByID } = require('../app/routes/api')

const db = require('better-sqlite3')('app.db')

function getFacts(tags = undefined) {
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
}
console.log(getFacts())

function filterFacts(facts, tags = []) {
    tags = !Array.isArray(tags) ? [tags] : tags
    return facts.filter(fact => {
        return tags.every(tag => {
            return fact.taglist.includes(tag)
        })
    })
}