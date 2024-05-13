const db = require('better-sqlite3')('app.db');
const fs = require('fs');
require('dotenv').config()
const crypto = require('crypto')

const initScript = fs.readFileSync('./db/initEntities.sql', 'utf8');
db.exec(initScript);

const insertScript = fs.readFileSync('./db/insertSampleData.sql', 'utf8');
db.exec(insertScript);

let addUserStmt = db.prepare('INSERT INTO user VALUES (?, ?, ?, ?, ?, ?, ?)')
let anonSalt = crypto.randomBytes(16)
let anonPwd = crypto.pbkdf2Sync(process.env.ANON_PWD, anonSalt, 310000, 32, 'sha256')
addUserStmt.run('zzz3737', process.env.ANON_EMAIL, anonPwd, null, null, 0, anonSalt)
let tomSalt = crypto.randomBytes(16)
let tomPwd = crypto.pbkdf2Sync(process.env.TOMS_PWD, tomSalt, 310000, 32, 'sha256')
addUserStmt.run('tom3737', 'tom@magliery.com', tomPwd, 'Thomas', 'Magliery', 1, tomSalt)

db.close();
