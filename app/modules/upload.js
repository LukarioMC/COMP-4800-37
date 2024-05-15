const multer = require('multer')
const fs = require('fs')

const UPLOAD_DIR = 'uploads'
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

module.exports = upload