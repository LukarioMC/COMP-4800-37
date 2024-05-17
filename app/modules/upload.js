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
        let newName
        
        while (true) {
            let prefix = `${Math.random()}-${Date.now()}`
            newName = prefix + path.extname(file.originalname)

            if (fs.existsSync(`./${UPLOAD_DIR}/${newName}`)) continue
            break
        }

        if (!req.res.locals.filenames) req.res.locals.filenames = []
        req.res.locals.filenames.push(newName)

        cb(null, newName)
    }
})

const maxFileSize = 10 * Math.pow(1024, 2)
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

    if (isUploadDirFull()) return cb(new Error('No space for further uploads.'))

    let validMimetype = VALID_FILE_TYPES.test(file.mimetype)
    let validExtname = VALID_FILE_TYPES.test(path.extname(file.originalname).toLowerCase())

    if (!validMimetype || !validExtname) { 
        return cb(new Error(`File ${file.originalname} is not of valid type. Only the following filetypes are supported - ${VALID_FILE_TYPES}`))
    }

    return cb(null, true)
}

/**
 * Delete the files specified from the uploads dir.
 * @param {Array<string>} filenames names of the files in the uploads dir to be deleted.
 */
function deleteUploads(filenames = []) {
    filenames.forEach((filename) => {
        try {
            fs.unlinkSync(`./${UPLOAD_DIR}/${filename}`)
        } catch (err) {
            console.log(err)
        }   
    })
}

module.exports = { 
    upload,
    deleteUploads
}