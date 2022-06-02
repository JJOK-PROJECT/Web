var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const { User } = require('../models/User');
const { auth } = require("../middleware/auth");

let authNum = Math.random().toString().substr(2, 6);

router.post('/register', (req, res) => {
    res.render('register')
    const user = new User({
        username: req.body.name,
        userid: req.body.id,
        password: req.body.pwd,
        email: req.body.email
    })
    user.save()
    console.log('저장 완료')
})

router.post('/signin', (req, res) => {
    var userid = req.body.id;
    var password = req.body.pwd;
    console.log(userid, password);
    if (typeof userid !== "string" && typeof password !== "string") {
        res.send("login failed");
        return;
    }
    User.findOne({ userid: userid }, (err, user) => {
        if (!user) {
            return res.send("login failed" + err);
        }
        // 요청된 이메일이 db에 있다면 비밀번호 일치여부 확인
        user.comparePassword(password, (err, isMatch) => {
            if (!isMatch)
                return res.json({
                    loginSuccess: false,
                    message: "Wrong password"
                });
            else {
                console.log('로그인 되었습니다.');
                user.generateToken((err, user) => {
                    if (err) return res.status(400).send(err);
                    // 토큰을 쿠키에 저장
                    res.cookie("user_auth", user.token)
                        .render('login', {
                            name: req.body.name,
                            id: req.body.id,
                            pwd: req.body.pwd
                    })
                });
            }
        });
    });
});


router.get('/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id },
        { token: "" }
        , (err, user) => {
            if (err) return res.send('로그아웃에 실패하였습니다.' + err);
            return res.send('로그아웃이 완료되었습니다.')
        })
})

router.get('/mail', async(req, res) => {

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
            console.log(error);
        }
        console.log("Finish sending email : " + info.response);
        res.send(authNum);
        transporter.close()
    });

    res.render('index');
})

router.get('/check', (req, res) => {
    console.log(req.query.name)
    User.findOne({username: req.query.name}, function (err, user) {
        if (err) return res.send('로그아웃에 실패하였습니다.' + err);
        else if(user == null) { //닉네임이 없다는 것은 중복되는 닉네임이 없다는 것을 의미함.
            return res.render('check', {success: true})
        }
        else { // 닉네임이 찾아졌다는 것은 이미 DB에 있다는 것임. 즉, 중복된 닉네임이므로 불가능하다는 메세지 보내기.
            return res.render('check', { success: false })
        }
    })
})

router.get('/checkCode', function (req, res) {
    console.log(authNum, req.query.code);
    if (req.query.code === authNum) {
        res.render('checkCode', { success: true })
    }
    else {
        res.render('checkCode', { success: false })
    }
})

module.exports = router;