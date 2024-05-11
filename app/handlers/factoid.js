const db = require('better-sqlite3')('app.db');

/**
 * Given an id, returns the associated fact.
 * @param {number} factID An integer representing a fact ID.
 * @returns Fact with the corresponding id and associated tags and attachments. Undefined if the id is not associated with any fact or is invalid.
 */
function getFactByID(factID) {
    try {
        let id = parseInt(factID);
        let fact, tags, attachments;

        let fetch = db.transaction((id) => {
            let getFactStmt = db.prepare(`SELECT * FROM factoid WHERE id = ?`);
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

        fact.tags = tags;
        fact.attachments = attachments;
        return fact;
    } catch (e) {
        console.log(e);
        return undefined;
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
				`);
        let unfilteredFacts = getFactsStmt.all();
        unfilteredFacts.forEach((fact) => {
            fact.taglist = fact.taglist ? fact.taglist.split(',').sort() : [];
        });

        let filteredFacts = filterFacts(unfilteredFacts, tags);

        return filteredFacts.map((fact) => {
            return getFactByID(fact.id);
        });
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

module.exports = {
    getFactByID,
    getFacts,
};
