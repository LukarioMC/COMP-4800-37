const db = require('better-sqlite3')('app.db')

function getFacts(tags = undefined) {
    let getFactsStmt
    if (tags) {
        getFactsStmt = db.prepare(`
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
        getFactsStmt = db.prepare('SELECT * FROM factoid WHERE is_approved')
        return getFactsStmt.all()
    } 
}

console.log(getFacts(["Cat B", "Cat D"]))