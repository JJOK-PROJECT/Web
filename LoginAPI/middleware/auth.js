const mysql = require('mysql');
require("dotenv").config();

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
})

let auth = (req, res, next) => {
    //인증 처리를 하는곳 
    //클라이언트 쿠키에서 토큰을 가져온다.

    let token = req.cookies.user_auth;
    // 토큰을 복호화 한후  유저를 찾는다.
    conn.query(`select * from userTable where token = '${token}'`, (err, result) => {
        if (err) throw err;
        if(result.length === 0) return res.json({ massage: '로그인 후 이용해주시기 바랍니다.' })
        else {
            next();
        }
    })

}

module.exports = { auth };