const db = require('../modules/db');

/**
 * Stores the report information into the report table
 * 
 * @param {*} factoidID The ID of the factoid
 * @param {*} submitterID The ID of the user who submitted the report
 * @param {*} issue The issue that the user has found
 */
function submitReport(factoidID, submitterID, issue) {
    try {
        db.prepare(`
            INSERT INTO report (factoid_id, submitter_id, issue)
            VALUES (?, ?, ?)`
        ).run(factoidID, submitterID, issue);
    } catch (e) {
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
    SELECT report.*, factoid.content as fact
    FROM report
    LEFT JOIN factoid ON report.factoid_id = factoid.id
    ORDER BY submission_date ASC
    `);

    return getReportsStmt.all();

    } catch (e) {
        return [];
    }
}

/**
 * Resolves/deletes the specified report.
 * 
 * @param {number} reportID The ID of the report being resolved
 * @returns 
 */
function resolveReport(reportID) {
    try {
        const resolveReportStmt = db.prepare(`
        DELETE FROM report
        WHERE id = ?
    `)
    return resolveReportStmt.run(reportID);
    } catch (e) {
        throw new Error(`Failed to resolve report.`);
    }
}

module.exports = {
    submitReport,
    getReports,
    resolveReport
}