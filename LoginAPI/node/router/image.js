var express = require('express');
var router = express.Router();
const path = require('path');
var multer = require('multer');
const { User } = require('../models/User');
const { auth } = require("../middleware/auth");
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/image/');
        },
        filename: function (req, file, cb) {
            var newFileName = new Date().valueOf() + path.extname(file.originalname)
            cb(null, newFileName);
        }
    }),
});

router.get('/', (req, res) => {
    res.render('image')
})

router.post('/upload', auth, upload.single('imageFile'), (req, res) => {
    let date = new Date();
    let today = date.getDate();

    var image = '/static/image/' + req.file.filename
    let upload = 'http://localhost:7080/image/' + req.file.filename;
    let array = {
        image_path: upload,
        upload_day: today
    }
    User.findOneAndUpdate({ _id: req.user._id },{$push : {image: array}}, (err, user) => {
        if (err) return res.json({ success: false, err });
        else {
            return res.send(`
                <h1>Image Upload Successfully</h1>
                <a href="/">Back</a>
                <p><img src="${image}" alt="image 출력"/></p>
            `);
        }
    })
});

module.exports = router;