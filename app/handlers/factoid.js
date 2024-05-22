const db = require('better-sqlite3')('app.db');

/**
 * Given an id, returns the associated fact.
 * @param {number} factID An integer representing a fact ID.
 * @param {boolean} isApproved Retrieves only an approved fact, set false to also retrieve non-approved (Default: true)
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
 * @param {boolean} isApproved Retrieve only approved facts, set false to retrieve only unapproved facts or omit/pass undefined to retrieve all facts.
 * @param {Array} tags a list of tag strings
 * @param {string} searchText search text
 * @param {number} pageNum current page number
 * @param {number} pageSize size of each page
 * @returns a list of facts with associated tags and attachments whose tags are a superset of the input tags and/or contain the search text. Returns empty list if error occurs.
 */
function getFacts(isApproved = undefined, tags = undefined, searchText = undefined, pageNum = undefined, pageSize = undefined) {
    try {
        let approvalStmt = '';
        if (isApproved === true) {
            approvalStmt = 'WHERE is_approved';
        } else if (isApproved === false) {
            approvalStmt = 'WHERE NOT is_approved';
        }
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
				${approvalStmt} 
				GROUP BY id         
				`);
        let unfilteredFacts = getFactsStmt.all();
        unfilteredFacts.forEach((fact) => {
            fact.taglist = fact.taglist ? fact.taglist.split(',').sort() : [];
        });

        let filteredFacts = filterFacts(unfilteredFacts, tags);

        let fetchedFacts = filteredFacts.map((fact) => {
            return getFactByID(fact.id, isApproved);
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
 * Deletes a fact from the database by its ID.
 * @param {number} factoidID The ID of the fact to delete.
 * @returns {boolean} True if the fact was successfully deleted, false otherwise.
 */
function deleteFactByID(factoidID) {
    try {
        const result = db.prepare('DELETE FROM Factoid WHERE id = ?').run(factoidID);

        return result.changes > 0;
    } catch (e) {
        console.log(e);
        return false;
    }
}

/**
 * Adds a new fact to the database.
 * @param {Object} factData An object containing data for the new fact.
 */
function addFact({ 
    submitter_id, 
    content, 
    discovery_date = new Date().toUTCString(), 
    note, tags = [], 
    attachments = []}) 
    {
    try {
        const stmt = db.prepare(`
            INSERT INTO Factoid (submitter_id, content, posting_date, discovery_date, note, is_approved, approval_date)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, false, NULL)
            RETURNING id
        `);

        db.transaction(() => {
            const factID = stmt.get(submitter_id, content, discovery_date, note).id

            insertTags(tags, factID)
            insertAttachments(attachments, factID)
        })()

    } catch (err) {
        throw new Error(`Failed to add fact because -> ${err.message}`)
    }
}

/**
 * Creates attachments in the database with the given path and fact ID.
 * @param {string} paths string containing filename
 * @param {integer} factID fact ID
 */
function insertAttachments(paths = [], factID) {

    let insertAttachmentStmt = db.prepare(`
        INSERT INTO attachment (factoid_id, link, type) 
        VALUES (?, ?, ?)
    `)
    
    paths.forEach((path) => {
        try {
            insertAttachmentStmt.run(factID, path, inferType(path))
        } catch (err) {
            throw new Error(`Failed to insert attachment ${path} because -> ${err.message}`)
        }
    })
}

/**
 * Infers the type of the attachment based on the extension name.
 * @param {string} name file/path name.
 * @returns attachment type as a string.
 */
function inferType(name) {
    if (/(jpg|jpeg|png|svg)$/.test(name)) return 'image'
    if (/(gif)$/.test(name)) return 'gif'
    if (/(mp3|mpeg)$/.test(name)) return 'audio'
    if (name.toLowerCase().contains('youtube.com')) return 'youtube'
    return 'website'
}

/**
 * Inserts tags associated with the fact with the given id.
 * @param {Array<string>} tags Name of the tag category. Must be a pre-existing category in the database.
 * @param {integer} id Fact ID
 */
function insertTags(tags = [], id) {
    const addTagStmt = db.prepare(`
        INSERT INTO tag
        VALUES (?, (SELECT id FROM category WHERE name = ?))
    `)

    tags.forEach((tag) => {
        try { 
            addTagStmt.run(id, tag) 
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
                throw new Error(`Failed to add tag ${tag} because -> Category ${tag} does not exist.`)
            } else {
                throw new Error(`Failed to add tag ${tag} because -> ${err.message}.`)
            }
        }
    })

}

/**
 * Approves a fact in the database by setting its approval status to true.
 * @param {number} factoidID The ID of the fact to approve.
 * @returns {boolean} True if the fact was successfully approved, false otherwise.
 */
function approveFactByID(factoidID) {
    try {
        let approveFactStmt = db.prepare('UPDATE factoid SET is_approved = 1 WHERE id = ?')
        let result = approveFactStmt.run(factoidID)
        return result.changes > 0
    } catch (e) {
        console.log(e);
        return false
    }
}

/**
 * Approves a fact in the database by setting its approval status to true.
 * @param {number} factoidID The ID of the fact to approve.
 * @returns {boolean} True if the fact was successfully approved, false otherwise.
 */
function approveFactByID(factoidID) {
    try {
        let approveFactStmt = db.prepare('UPDATE factoid SET is_approved = 1 WHERE id = ?')
        let result = approveFactStmt.run(factoidID)
        return result.changes > 0
    } catch (e) {
        console.log(e);
        return false
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

/**
 * Returns all unapproved facts
 * @returns All unapproved facts
 */
function getUnapprovedFacts() {
    return getFacts(false);
}

module.exports = {
    getFactByID,
    getFacts,
    addFact,
    updateFact,
    getRandomFact,
    getUnapprovedFacts,
    deleteFactByID,
    approveFactByID
};
