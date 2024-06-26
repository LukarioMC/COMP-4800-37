const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'app/public/uploads'
const MAX_FILE_SIZE = (process.env.MAX_FILE_SIZE || 10) * Math.pow(1024, 2)
const MAX_UPLOAD_DIR_SIZE = (process.env.MAX_UPLOAD_DIR_SIZE || 1000) * Math.pow(1024, 2)
const VALID_FILE_TYPES = {
    image: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'],
    audio: ['mp3', 'mpeg'],
};
const VALID_FILE_TYPES_REGEX = new RegExp('(' + Object.values(VALID_FILE_TYPES).flat().join('|') + ')$');

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

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: filterFiles
})

/**
 * Infers the type of the attachment based on the extension name.
 * @param {string} name file/path name.
 * @returns attachment type as a string.
 */
function inferType(name) {
    for (type in VALID_FILE_TYPES) {
        const typeRegex = new RegExp('(' + VALID_FILE_TYPES[type].join('|') + ')$');
        if (typeRegex.test(name))
            return type;
    }
    // Type was not of a regular file type, continue inferring.
    name = name.toLowerCase();
    if (name.includes('youtube.com') || name.includes('youtu.be')) return 'youtube';
    return 'website';
}

/**
 * Parses a youtube.com or youtu.be link into an embedded URL for display on the site.
 * Note: Strips all query strings from the passed URL, and retains only the video ID.
 * @param {string} url Of the youtube link.
 * @returns String of youtube URL w/ embedded video ID, or null
 */
function parseYoutubeUrlToEmbeded(url) {
    const parsedUrl = new URL(url);
    let videoId;
    if (parsedUrl.hostname === 'www.youtube.com') {
        videoId = parsedUrl.searchParams.get('v');
    } else if (parsedUrl.hostname === 'youtu.be') {
        const pathSegments = parsedUrl.pathname.split('/');
        videoId = pathSegments[1];
    }
    // Construct the embedded YouTube link from parsed video ID
    if (videoId) {
        const embeddedLink = `https://www.youtube.com/embed/${videoId}`;
        return embeddedLink;
    } else {
        return null;
    }
}

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

    let validMimetype = VALID_FILE_TYPES_REGEX.test(file.mimetype)
    let validExtname = VALID_FILE_TYPES_REGEX.test(path.extname(file.originalname).toLowerCase())

    if (!validMimetype || !validExtname) { 
        return cb(new Error(`File ${file.originalname} is not of valid type. Only the following filetypes are supported - ${[].concat(Object.values(VALID_FILE_TYPES))}`))
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
    deleteUploads,
    inferType,
    parseYoutubeUrlToEmbeded
}