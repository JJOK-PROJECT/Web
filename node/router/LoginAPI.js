var express = require('express');
var router = express.Router();
const User = require('../models/user');
/* GET home page. */

router.post('/register', (req, res) => {
    res.render('register')
    const user = new User({
        username: req.body.name,
        userid: req.body.id,
        password: req.body.pwd
    })
    user.save()
    console.log('저장 완료')
})

router.post('/signin', (req, res) => {
    var userid = req.body.id; 
    var password = req.body.pwd; 
    console.log(userid, password); 
    if (typeof userid !== "string" && typeof password !== "string") 
    { 
        res.send("login failed"); 
        return; 
    } 
    User.findOne({ email: req.body.email }, (err, user) => {
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
                    res.render('login', {
                        name: req.body.name,
                        id: req.body.id,
                        pwd: req.body.pwd
                    })
                }
            // 일치 시, 토큰 생성 후 쿠키에 저장
        });
    }); 
});

module.exports = router;