var express = require('express');
var router = express.Router();
const { User } = require('../models/User');
const { auth } = require("../middleware/auth");
/* GET home page. */

router.post('/register', (req, res) => {
    res.render('register')
    const user = new User({
        username: req.body.name,
        userid: req.body.id,
        password: req.body.pwd,
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

router.get('/auth', auth, (req, res) => {
    // 여기까지 미들웨어(auth.js)를 통과해 왔다는 얘기는 Authentication이 True라는 말
    // 클라이언트에게 유저 정보 전달
    res.render('auth', {
        isAuth: true
    });
})

router.get('/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id },
        { token: "" }
        , (err, user) => {
            if (err) return res.send('로그아웃에 실패하였습니다.' + err);
            return res.send('로그아웃이 완료되었습니다.')
        })
})

module.exports = router;