const db = require('better-sqlite3')('app.db')

const all = db.prepare(`
SELECT 
    *, group_concat(name) as taglist
FROM (
    SELECT fulltag.id as cat_id, * FROM
    factoid LEFT JOIN (
        tag JOIN category
        ON tag.category_id = category.id
    ) as fulltag
    ON factoid.id = factoid_id
) as fullfactoid
WHERE is_approved
GROUP BY id         
`)
console.log(all.all())