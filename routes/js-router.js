const router = require("express").Router()
const multer = require('multer')
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter
});

const js_controller = require("../controllers/js.controller");

router.post("/upload-js", upload.single('file2'), js_controller.readFileJS);

function fileFilter(req, file, cb) {
    if (file.mimetype === 'text/javascript' || file.mimetype === 'application/x-javascript') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

module.exports = router
