var express = require('express');
var router = express.Router();
const path = require('path');
var multer = require('multer');
const { User } = require('../models/User');
const { auth } = require("../middleware/auth");
let image_array = new Array();
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

router.get('/', auth,(req, res) => {
    res.render('image')
})

router.post('/upload', upload.single('imageFile'), (req, res) => {
    let date = new Date();
    let today = date.getDate();
    // let tomorrow = new Date(date.setDate(date.getDate() + 1));
    // console.log(tomorrow.getDate())
    var image = '/static/image/' + req.file.filename
    let upload = 'http://localhost:7080/image/' + req.file.filename;
    let array = {
        image_path: upload,
        upload_day: today + '/' + date.getHours() + '/' + date.getMinutes()
    }
    image_array.push(image)
    const json = {
        'image_path' : image_array
    }
    console.log(json);
    User.findOneAndUpdate({ _id: req.user._id },{$push : {image: array}}, (err, user) => {
        if (err) return res.json({ success: false, err });
        else {
            return res.render('gallary', { image_json: json })
        }
    })
});

module.exports = router;