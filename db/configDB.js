const db = require('better-sqlite3')('app.db');
const fs = require('fs');
require('dotenv').config();
const crypto = require('crypto');

const initScript = fs.readFileSync('./db/initEntities.sql', 'utf8');
db.exec(initScript);

const { ANON_PWD, ANON_EMAIL, TOMS_PWD } = process.env;
if (!ANON_PWD || !ANON_EMAIL || !TOMS_PWD)
    throw 'Invalid configuration! `.env` *must* provide values for "ANON_PWD", "ANON_EMAIL", & "TOMS_PWD"';
let addUserStmt = db.prepare('INSERT INTO user VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
let anonSalt = crypto.randomBytes(16);
let anonPwd = crypto.pbkdf2Sync(ANON_PWD, anonSalt, 310000, 32, 'sha256');
addUserStmt.run('zzz3737', ANON_EMAIL, anonPwd, null, null, null, 0, anonSalt);
let tomSalt = crypto.randomBytes(16);
let tomPwd = crypto.pbkdf2Sync(TOMS_PWD, tomSalt, 310000, 32, 'sha256');
addUserStmt.run(
    'mag3737',
    'tom@thirty-seven.org',
    tomPwd,
    'Thomas',
    'Magliery',
    'US',
    1,
    tomSalt
);

const insertScript = fs.readFileSync('./db/insertSampleData.sql', 'utf8');
db.exec(insertScript);

let updateAnonFactsStmt = db.prepare(`
    UPDATE factoid
    SET submitter_id = 'zzz3737'
    WHERE submitter_id IS NULL
`);
updateAnonFactsStmt.run();

db.close();
console.log('SQLite database (app.db) has been initialized and seeded.');
