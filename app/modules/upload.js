const multer = require('multer')
const fs = require('fs')
const path = require('path')
const db = require('better-sqlite3')('app.db');
require('dotenv').config()

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
const MAX_UPLOAD_DIR_SIZE = process.env.MAX_UPLOAD_DIR_SIZE || 1 * Math.pow(1024, 3)
const VALID_FILE_TYPES = /(jpg|jpeg|png|svg|webp|gif|mp3|mpeg)$/

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR)
    },
    filename: (req, file, cb) => {
        let prefix = `${Math.random()}-${Date.now()}`
        let newName = prefix + path.extname(file.originalname)

        if (!req.res.locals.filenames) req.res.locals.filenames = []
        req.res.locals.filenames.push(newName)

        cb(null, newName)
    }
})

const maxFileSize = 10 * 1024 * 1024
const upload = multer({
    storage: storage,
    limits: {
        fileSize: maxFileSize
    },
    fileFilter: filterFiles
})

/**
 * Returns whether the designated upload directory is above the max permissible size.
 * @returns Whether the designated upload directory is above the max permissible size
 */
function isUploadDirFull() {
    let dir = fs.readdirSync(`./${UPLOAD_DIR}`)
    let dirSize = dir.reduce((acc, file) => {
        return acc + fs.statSync(`./${UPLOAD_DIR}/${file}`)
    }, 0)
    return dirSize > MAX_UPLOAD_DIR_SIZE
}

/**
 * Decides whether to upload given files or not.
 * @param {*} req http request
 * @param {*} file given file
 * @param {*} cb callback
 */
function filterFiles(req, file, cb) {
    if (!req.res.locals.attIDs) req.res.locals.attIDs = []

    if (isUploadDirFull()) return cb(new Error('Upload directory is full.'))

    let validMimetype = VALID_FILE_TYPES.test(file.mimetype)
    let validExtname = VALID_FILE_TYPES.test(path.extname(file.originalname).toLowerCase())

    if (!validMimetype || !validExtname) { 
        return cb(new Error(`Only the following filetypes are supported - ${VALID_FILE_TYPES}`))
    }

    return cb(null, true)
}

module.exports = { 
    upload
}