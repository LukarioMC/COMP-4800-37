const db = require('../modules/db');
const fs = require('fs')
require('dotenv').config

const DAY_IN_MS = 24 * 60 * 60 * 1000
const BACKUP_INTERVAL = process.env.BACKUP_INTERVAL || DAY_IN_MS
const MAX_BACKUPS = process.env.MAX_BACKUPS || 100
const BACKUP_DIR_NAME = process.env.BACKUP_DIR_NAME || 'db_backups'
const MAX_DIR_SIZE = (process.env.MAX_DIR_SIZE || 1) * Math.pow(2, 20) 

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
    return db.backup(`${BACKUP_DIR_NAME}/backup-${Date.now()}.db`)
    .then(() => {
        console.log('Backup File Saved.');
        trimBackups()
    })
}

/**
 * If there are more than MAX_BACKUPS backup files in the backup dir, delete the oldest ones until there are equal to MAX_BACKUP
 */
function trimBackups() {
    let backupDir = fs.readdirSync(`./${BACKUP_DIR_NAME}`) 
    while (backupDir.length > MAX_BACKUPS || getDirSize(backupDir) > MAX_DIR_SIZE) { 
        let oldestBackup = backupDir.sort()[0]
        fs.unlinkSync(`${BACKUP_DIR_NAME}/${oldestBackup}`)
        backupDir = fs.readdirSync(`./${BACKUP_DIR_NAME}`)
    }
}

/**
 * Measures the cumulative size of all the files provided.
 * @param {*} dirFiles A list of file names in the backup directory.
 * @returns total size in bytes.
 */
function getDirSize(dirFiles) {
    return dirFiles.reduce((acc, file) => {
        return acc + fs.statSync(`${BACKUP_DIR_NAME}/${file}`).size
    }, 0)
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
            backupDB().catch(err => {
                console.log(`Backup Trim Failed: ${err}`)
                this.stop()
            })
        }, BACKUP_INTERVAL) 
    }

    /**
     * Stop the backup timer.
     */
    stop() { 
        console.log('Stopping backup timer.')
        clearInterval(this.timer) 
    }
}

module.exports = new BackupTimer()