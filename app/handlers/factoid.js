const db = require('better-sqlite3')('app.db');
const { getTags } = require('./tag')

/**
 * Given an id, returns the associated fact.
 * @param {number} factID An integer representing a fact ID.
 * @returns Fact with the corresponding id and associated tags and attachments. Undefined if the id is not associated with any fact or is invalid.
 */
function getFactByID(factID, isApproved = true) {
    try {
        let id = parseInt(factID);
        let fact, tags, attachments;

        let fetch = db.transaction((id) => {
            const statement = isApproved
                ? 'SELECT * FROM factoid WHERE id = ? AND is_approved'
                : 'SELECT * FROM factoid WHERE id = ?';
            let getFactStmt = db.prepare(statement);
            fact = getFactStmt.get(id);

            let getTagsStmt = db.prepare(
                `SELECT * FROM (tag JOIN category on category_id = category.id) WHERE factoid_id = ?`
            );
            tags = getTagsStmt.all(id);

            let getAttachmentsStmt = db.prepare(
                `SELECT * FROM attachment WHERE factoid_id = ?`
            );
            attachments = getAttachmentsStmt.all(id);
        });
        fetch(id);

        // Return undefined if there was no fact retrieved
        if (!fact) return undefined;

        fact.tags = tags;
        fact.attachments = attachments;
        return fact;
    } catch (e) {
        console.log(e);
        return undefined;
    }
}

/**
 * Given a list of tags, returns facts filtering out those who do not have all the given tags or do not have the search text in their content or note.
 * @param {Array} tags a list of tag strings
 * @param {string} searchText search text
 * @returns a list of facts with associated tags and attachments whose tags are a superset of the input tags and/or contain the search text. Returns empty list if error occurs.
 */
function getFacts(tags = undefined, searchText = undefined, pageNum = undefined, pageSize = undefined) {
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
				`);
        let unfilteredFacts = getFactsStmt.all();
        unfilteredFacts.forEach((fact) => {
            fact.taglist = fact.taglist ? fact.taglist.split(',').sort() : [];
        });

        let filteredFacts = filterFacts(unfilteredFacts, tags);

        let fetchedFacts = filteredFacts.map((fact) => {
            return getFactByID(fact.id);
        });

        if (searchText) {
            searchText = searchText.toLowerCase()
            fetchedFacts = fetchedFacts.filter(fact => {
                if (fact.note && fact.note.toLowerCase().includes(searchText)) return true
                else return fact.content.toLowerCase().includes(searchText)
            })
        }

        if (pageNum && pageSize && pageNum > 0 && pageSize > 0) {
            let offset = (pageNum - 1) * pageSize
            fetchedFacts = fetchedFacts.slice(offset, offset + pageSize)
        }

        return fetchedFacts
    } catch (e) {
        console.log(e);
        return [];
    }
}

/**
 * Filters a list of facts by their tags. Returned facts have tags that are a superset of the given tags.
 * @param {*} facts a list of facts to be filtered.
 * @param {*} tags a list of tags to filter with.
 * @returns a filtered list of facts.
 */
function filterFacts(facts, tags = []) {
    tags = !Array.isArray(tags) ? tags.split(',') : tags; // Split passed tags into comma-separated array
    return facts.filter((fact) => {
        // Check if all provided filter tags are included in the facts tag list
        return tags.every((tag) => {
            return fact.taglist.includes(tag);
        });
    });
}

/**
 * Adds a new fact to the database.
 * @param {Object} factData An object containing data for the new fact.
 * @returns {boolean} True if the fact was successfully added, false otherwise.
 */
function addFact(factData) {
    try {
        let { submitter_id, content, discovery_date, note, tags} = factData;
        tags = tags || []
        discovery_date = discovery_date || new Date().toUTCString()

        const stmt = db.prepare(`
            INSERT INTO Factoid (submitter_id, content, posting_date, discovery_date, note, is_approved, approval_date)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, false, NULL)
            RETURNING id
        `);
        const id = stmt.get(submitter_id, content, discovery_date, note).id;

        const addTagStmt = db.prepare(`
            INSERT INTO tag
            VALUES (?, (SELECT id FROM category WHERE name = ?))
        `)
        const insertTags = db.transaction((tags) => {
            tags.forEach((tag) => {
                try { 
                    addTagStmt.run(id, tag) 
                } catch (err) {
                    if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
                        console.log(`Category ${tag} does not exist`)
                    } else {
                        console.log(err)
                    }
                }
            })
        })
        insertTags(tags)

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

/**
 * Updates an existing fact in the database.
 * @param {number} factID The ID of the fact to be updated.
 * @param {Object} updatedData An object containing updated data for the fact.
 * @returns {Object} An object containing the result of the update operation and a message.
 */
function updateFact(factID, updatedData) {
    try {
        const { content, note, discovery_date, tags } = updatedData;

        // Retrieve the current fact data
        const currentFactStmt = db.prepare('SELECT content, note, discovery_date FROM Factoid WHERE id = ?');
        const currentFact = currentFactStmt.get(factID);

        if (!currentFact) {
            console.log(`Fact with ID ${factID} not found`);
            return { success: false, message: 'Fact not found' };
        }

        // Use existing values if the new values are not provided
        const newContent = content || currentFact.content;
        const newNote = note || currentFact.note;
        const newDiscoveryDate = discovery_date || currentFact.discovery_date;

        const stmt = db.prepare(`
            UPDATE Factoid 
            SET content = ?, note = ?, discovery_date = ?
            WHERE id = ?
        `);
        stmt.run(newContent, newNote, newDiscoveryDate, factID);

        if (!updateTags(factID, tags || [])) {
            return {success: false, message: 'Failed to update tags.'}
        }

        return { success: true };
    } catch (e) {
        console.log(e);
        return { success: false, message: 'Server error' };
    }
}

/**
 * Updates the tags of a fact so that the only tags in the database will be those in the given tags.
 * @param {*} factID ID of the fact whose tags will be updated.
 * @param {*} tags Names of the given fact's tags.
 * @returns true if query was successful, false otherwise.
 */
function updateTags(factID, tags) {
    let update = db.transaction(() => {
        let currTags = db.prepare(`
            SELECT id, name
            FROM tag 
                JOIN category 
                ON tag.category_id = category.id
            WHERE factoid_id = ?
        `).all(factID)

        let currTagNames = currTags.map(tag => {return tag.name})
        tags.forEach((tag) => {
            if (!currTagNames.includes(tag)) {
                const addTagStmt = db.prepare(`
                    INSERT INTO tag
                    VALUES (?, (SELECT id FROM category WHERE name = ?))
                `)

                try { 
                    addTagStmt.run(factID, tag)
                } catch (err) {
                    if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
                        console.log(`Category ${tag} does not exist`)
                    } else {
                        console.log(err)
                    }
                }
            }
        })

        currTags.forEach(currTag => {
            if (!tags.includes(currTag.name)) {
                const deleteTagStmt = db.prepare(`
                    DELETE FROM tag
                    WHERE category_id = ? AND factoid_id = ?
                `)
                try {
                    deleteTagStmt.run(currTag.id, factID)
                } catch (err) {
                    console.log(err)
                }
                
            }
        })
    })

    try {
        update()
        return true
    } catch (e) {
        return false
    }
}

/**
 * Returns a random approved fact.
 * @returns A random approved fact.
 */
function getRandomFact() {
    try {
        let randomID = db.prepare(`SELECT id FROM factoid WHERE is_approved ORDER BY RANDOM() LIMIT 1`).get().id
        return getFactByID(randomID)     
    } catch (err) {
        console.log(err)
        return null
    }
}

// /**
//  * Returns all unapproved facts
//  * @returns All unapproved facts
//  */
// function getUnapprovedFacts() {
//     try {
//         const unapprovedFactsStmt = db.prepare(
//             `SELECT * FROM factoid
//             LEFT JOIN tag ON factoid.id=tag.factoid_id
//             WHERE NOT is_approved
//             ORDER BY posting_date`);
//         const unapprovedFacts = unapprovedFactsStmt.all();
//         return unapprovedFacts;
//     } catch (err) {
//         console.log(err);
//         return null;
//     }
// }

/**
 * Returns all unapproved facts with their associated tags.
 * @returns a list of unapproved facts with associated tags.
 */
function getUnapprovedFacts() {
    try {
        let getUnapprovedFactsStmt = db.prepare(`
            SELECT 
                factoid.id, 
                factoid.submitter_id, 
                factoid.content, 
                factoid.posting_date, 
                factoid.note, 
                group_concat(category.name) as taglist
            FROM factoid
            LEFT JOIN tag ON factoid.id = tag.factoid_id
            LEFT JOIN category ON tag.category_id = category.id
            WHERE NOT factoid.is_approved
            GROUP BY factoid.id
            ORDER BY factoid.posting_date
        `);

        let unapprovedFacts = getUnapprovedFactsStmt.all();
        unapprovedFacts.forEach(fact => {
            fact.taglist = fact.taglist ? fact.taglist.split(',').sort() : [];
        });

        return unapprovedFacts;
    } catch (err) {
        console.log(err);
        return [];
    }
}

module.exports = {
    getFactByID,
    getFacts,
    addFact,
    updateFact,
    getRandomFact,
    getUnapprovedFacts
};
