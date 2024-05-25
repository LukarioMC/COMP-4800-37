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

/**
 * Gets all the rows in the report table
 * 
 * @returns All rows in the report table
 */
function getReports() {
    try {
        const getReportsStmt = db.prepare(`
        SELECT * FROM report ORDER BY submission_date ASC
    `);

    return getReportsStmt.all();

    } catch (e) {
        return [];
    }
}

module.exports = {
    submitReport,
    getReports
}