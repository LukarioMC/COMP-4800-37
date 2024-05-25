const db = require('../modules/db');

/**
 * Stores the report information into the report table
 * 
 * @param {*} factoidID The ID of the factoid
 * @param {*} submitterID The ID of the user who submitted the report
 * @param {*} factoidContent The fact itself
 * @param {*} issue The issue that the user has found
 */
function submitReport(factoidID, submitterID, factoidContent, issue) {
    try {
        db.prepare(`
            INSERT INTO report (factoid_id, submitter_id, factoid_content, issue)
            VALUES (?, ?, ?, ?)`
        ).run(factoidID, submitterID, factoidContent, issue);
    } catch (err) {
        throw new Error(`Failed to send report.`);
    }
}

module.exports = {
    submitReport
}