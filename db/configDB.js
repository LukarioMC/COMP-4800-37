const db = require('better-sqlite3')('app.db');
const fs = require('fs');

const initScript = fs.readFileSync('./db/initEntities.sql', 'utf8');
db.exec(initScript);

const insertScript = fs.readFileSync('./db/insertSampleData.sql', 'utf8');
db.exec(insertScript);

db.close();
