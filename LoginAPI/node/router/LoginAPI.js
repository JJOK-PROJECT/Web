const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { auth } = require("../middleware/auth");
require("dotenv").config();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

router.post('/register', (req, res) => {
    const name = req.body.name
    const uid = req.body.id
    const password = bcrypt.hashSync(`${req.body.pwd}`, 10);
    const email = req.body.email
    const status = req.body.status
    const grade = req.body.grade

    conn.query(`insert into userTable(userName, userId, password, email, status, grade) value(
        '${name}',
        '${uid}',
        '${password}',
        '${email}',
        '${status}',
        ${grade}
    )`, (err, results) => {
        if(err) {
            res.json({'massage': err});
        } else {
            res.json({ 
                'name' : name,
                'uid' : uid,
                'password' : password,
                'email' : email,
                'status' : status,
                'grade' : grade
            });
        }
    });
})

router.post('/signin', (req, res) => {
    const uid = req.body.id;
    const pwd = req.body.pwd;

    if (typeof uid !== "string" && typeof pwd !== "string") {
        res.send("login failed");
        return;
    }

    conn.query(`select password from userTable where userId ='${uid}'`, (err, result) => {
        if(err) {
            return res.json({'massage' : err});
        }
        if (result.length === 1) {
            const encodePwd = result[0].password
            bcrypt.compare(pwd, encodePwd, (err, same) => {
                if(err) {
                    return res.json({ 'massage': err });
                } else {
                    console.log('로그인 되었습니다.');
                    const token = jwt.sign(uid, 'secretToken')
                    console.log('Token : ', token)
                    conn.query(`update userTable set token = '${token}' where userId = '${uid}'`, (err, result) => {
                        if (err) {
                            res.json({ 'massage': err });
                        } else {
                            console.log(result);
                            return res.cookie("user_auth", token)
                                .json({
                                    success: true,
                                    name: req.body.name,
                                    id: req.body.id,
                                    pwd: req.body.pwd
                                })
                        }
                    });
                }
            })
        } else {
            return res.json({ massage: "유저를 찾을 수 없습니다." });
        }
    })
});


router.get('/logout', auth, (req, res) => {
    let token = req.cookies.user_auth;
    conn.query(`update userTable set token = '' where token = '${token}'`, (err, result) => {
        if (err) { // token을 가진 사용자가 없다
            return res.json({ 'massage': err });
        } else {
            res.json({ 'massage': '로그아웃이 완료되었습니다.', })
        }
    })
    
})

router.get('/mail', async(req, res) => {
    let authNum = Math.random().toString().substr(2, 6);
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "lap721181@gmail.com",
            pass: "hrjeywvvlkybdszv"
        },
    });


    const mailOptions = await transporter.sendMail({
        from: "lap721181@gmail.com",
        to: req.query.email,
        subject: "회원가입 완료를 위해 아래에 적혀진 인증코드를 인증코드 입력 칸에 적어주세요.",
        html: 
        `<p style='color: black'>회원 가입을 위한 인증번호 입니다.</p>
        <p style = 'color:black'>아래의 인증 번호를 입력하여 인증을 완료해주세요.</p>
        <h2>${authNum}</h2>`
    });

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.json({ error: error, success: false});
        }
        else {
            res.status(200).json({ success: true, email: req.query.email});
        }
        console.log("Finish sending email : " + info.response);
        transporter.close()
    });
})

router.get('/check', (req, res) => {
    console.log(req.query.name)
    conn.query(`select userName from userTable where userName = '${req.query.name}'`, (err, user) => {
        if (err) return res.json({ success: false, massage: err });
        else if (user.length === 0) { //닉네임이 없다는 것은 중복되는 닉네임이 없다는 것을 의미함.
            return res.json({ success: true, massage: "중복된 닉네임 X" })
        }
        else { // 닉네임이 찾아졌다는 것은 이미 DB에 있다는 것임. 즉, 중복된 닉네임이므로 불가능하다는 메세지 보내기.
            return res.json({ success: false, massage: "닉네임 중복 됨." })
        }
    })
    
})

router.get('/checkCode', function (req, res) {
    console.log(authNum, req.query.code);
    if (req.query.code === authNum) {
        res.json({ success: true, code: req.query.code})
    }
    else {
        res.json({ success: false, massage: '코드가 일치하지 않습니다.' })
    }
})

module.exports = router;