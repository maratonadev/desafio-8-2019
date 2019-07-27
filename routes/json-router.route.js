const router = require("express").Router()
const multer = require('multer')
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter
})

const json_controller = require("../controllers/json.controller");

router.post("/upload-json", upload.single('file'), json_controller.readFileJSON);

function fileFilter(req, file, cb) {
    if (file.mimetype == 'application/json') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

module.exports = router