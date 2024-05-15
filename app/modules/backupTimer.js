const db = require('better-sqlite3')('app.db');
const fs = require('fs')
require('dotenv').config

const BACKUP_INTERVAL = process.env.BACKUP_INTERVAL || 1000 * 60 * 60 * 24
const MAX_BACKUPS = process.env.MAX_BACKUPS || 100
const BACKUP_DIR_NAME = process.env.BACKUP_DIR_NAME || 'db_backups'

/**
 * Create the backup directory if it does not exist.
 */
function init() {
    if (!fs.existsSync(BACKUP_DIR_NAME)){
        fs.mkdirSync(BACKUP_DIR_NAME);
    }
}

/**
 * Save a back up of the database in the backup directory.
 */
function backupDB() {
    db.backup(`${BACKUP_DIR_NAME}/backup-${Date.now()}.db`)
  .then(() => {
    console.log('backup complete!');
    trimBackups()
  })
  .catch((err) => {
    console.log('backup failed:', err);
  });
}

/**
 * If there are more than MAX_BACKUPS backup files in the backup dir, delete the oldest ones until there are equal to MAX_BACKUP
 */
function trimBackups() {
    let backupDir = fs.readdirSync(`./${BACKUP_DIR_NAME}`) 
    while (backupDir.length > MAX_BACKUPS) { 
        let oldestBackup = backupDir.sort()[0]
        fs.unlinkSync(`${BACKUP_DIR_NAME}/${oldestBackup}`)
        backupDir = fs.readdirSync(`./${BACKUP_DIR_NAME}`)
    }
}

/** Class that controls the backup interval. */
class BackupTimer {


    /**
     * Create a backup timer.
     */
    constructor() { init() }

    /**
     * Start the backup timer.
     */
    start() {
        this.timer = setInterval(() => {
            backupDB()
        }, BACKUP_INTERVAL) 
    }

    /**
     * Stop the backup timer.
     */
    stop() { clearInterval(timer) }
}

module.exports = new BackupTimer()