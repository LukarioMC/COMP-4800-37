const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
const MAX_UPLOAD_DIR_SIZE = process.env.MAX_UPLOAD_DIR_SIZE || 1024 * Math.pow(1024, 3)
const VALID_FILE_TYPES = /(jpg|jpeg|png|svg|webp|gif|mp3)$/

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR)
    },
    filename: (req, file, cb) => {
        let prefix = `${Math.random()}-${Date.now()}`
        let name = prefix + path.extname(file.originalname)
        insertAttachment(req.params.factID, name, inferType())
        cb(null, name)
    }
})

const maxFileSize = 1 * 1024 * 1024
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
    if (isUploadDirFull()) return cb(new Error('Upload directory is full.'))

    let validMimetype = VALID_FILE_TYPES.test(file.mimetype)
    let validExtname = VALID_FILE_TYPES.test(path.extname(file.originalname).toLowerCase())

    if (validMimetype && validExtname) return cb(null, true)

    return cb(new Error(`Only the following filetypes are supported - ${VALID_FILE_TYPES}`))
}

function insertAttachment(factID, route, type) {
    let insertAttachmentStmt = db.prepare(`
        INSERT INTO attachment (factoid_id, link, type) 
        VALUES (?, ?, ?) 
    `)
    insertAttachmentStmt.run(factID, route, type)
}

function inferType(name) {
    if (/(jpg|jpeg|png|svg)$/.test(name)) return 'image'
    if (/(gif)$/.test(name)) return 'gif'
    if (/(mp3)$/.test(name)) return 'audio'
    else return 'other'
}

module.exports = { 
    upload
}