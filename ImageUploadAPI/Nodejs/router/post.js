var express = require('express');
var router = express.Router();
const path = require('path');
var multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'static/image/');
    },
    filename: function (req, file, cb) {
        var newFileName = new Date().valueOf() + path.extname(file.originalname)
        cb(null, newFileName);
    }
  }),
});

router.post('/', upload.single('imageFile'), (req, res) => {
  var file = '/image/' + req.file.filename
    res.send(`
        <h1>Image Upload Successfully</h1>
        <a href="/">Back</a>
        <p><img src="${file}" alt="image 출력"/></p>`
    );
    console.log(file);
});

module.exports = router;