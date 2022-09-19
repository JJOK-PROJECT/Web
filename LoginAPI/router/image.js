var express = require('express');
var router = express.Router();
const path = require('path');
var multer = require('multer');
const { auth } = require("../middleware/auth");
require("dotenv").config();
const mysql = require('mysql');

const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: '3306',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWARD,
    database: 'userDB'
})

conn.connect((err) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log('mysql connecting...')
    }
})

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
    let token = req.cookies.user_auth;
    res.status(200).json({ massage:'이미지 화면에 들어오신 것을 확인하십니다.', isAuth: true, token: token });
})

router.post('/upload', upload.single('imageFile'), (req, res) => {
    let token = req.cookies.user_auth;
    // let tomorrow = new Date(date.setDate(date.getDate() + 1));
    // console.log(tomorrow.getDate())
    var image = '/static/image/' + req.file.filename
    let upload = 'http://localhost:7080/image/' + req.file.filename;

    conn.query(`update userTable set image_path = '${image}', path_flutter = '${upload}' where token = '${token}'`, (err, result) => {
        if(err) {
            return res.json({ success: false, err });
        } else {
            console.log(result);
            return res.status(200).json({ massage: '제대로 전달 됨.', success: true, image : image, upload: upload })
        }
    })

});

module.exports = router;