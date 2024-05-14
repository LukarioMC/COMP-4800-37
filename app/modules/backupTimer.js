const db = require('better-sqlite3')('app.db');
const fs = require('fs')

const BACKUP_INTERVAL = 1000 * 60 * 60 * 24
const maxBackups = 100
const backUpDirName = 'db_backups'

function init() {
    if (!fs.existsSync(backUpDirName)){
        fs.mkdirSync(backUpDirName);
    }
}

function backupDB() {
    db.backup(`${backUpDirName}/backup-${Date.now()}.db`)
  .then(() => {
    console.log('backup complete!');
    trimBackups()
  })
  .catch((err) => {
    console.log('backup failed:', err);
  });
}

function trimBackups() {
    let backupDir = fs.readdirSync(`./${backUpDirName}`) 
    while (backupDir.length > maxBackups) { 
        let oldestBackup = backupDir.sort()[0]
        fs.unlinkSync(`${backUpDirName}/${oldestBackup}`)
        backupDir = fs.readdirSync(`./${backUpDirName}`)
    }
}

class BackupTimer {
    constructor() { init() }

    start() {
        this.timer = setInterval(() => {
            backupDB()
        }, BACKUP_INTERVAL) 
    }

    stop() { clearInterval(timer) }
}

module.exports = new BackupTimer()