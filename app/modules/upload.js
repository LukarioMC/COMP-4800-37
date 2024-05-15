const multer = require('multer')
const fs = require('fs')
require('dotenv').config()

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
const MAX_UPLOAD_DIR_SIZE = process.env.MAX_UPLOAD_DIR_SIZE || 1024 * Math.pow(1024, 3)

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {cb(null, UPLOAD_DIR)},
    filename: (req, file, cb) => {
        cb(null, file.filename + '-' + Date.now() + '.jpg')
    }
})
const maxSize = 1 * 1024 * 1024
const upload = multer({
    storage: storage,
    limits: {fileSize: maxSize}
})

function isUploadDirFull() {
    let dir = fs.readdirSync(`./${UPLOAD_DIR}`)
    let dirSize = dir.reduce((acc, file) => {
        return acc + fs.statSync(`./${UPLOAD_DIR}/${file}`)
    }, 0)
    return dirSize > MAX_UPLOAD_DIR_SIZE
}

module.exports = { 
    upload, 
    isUploadDirFull 
}