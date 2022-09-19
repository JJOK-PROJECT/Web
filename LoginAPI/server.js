const express = require('express');
const app = express();
const loginRouter = require('./router/LoginAPI');
const imageRouter = require('./router/image');
const cookieParser = require("cookie-parser");
const multer = require('multer');
const { conn } = require("./config/config");
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/static', express.static('public'));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({
        massage: "인덱스 화면과 연결 잘 됨."
    });
});

app.use('/image', imageRouter)
app.use('/login', loginRouter)

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

app.post('/create_contact', upload.array('imageFile', 4), (req, res) => {
    const title = req.body.title;
    const contact = req.body.contact;
    const token = req.cookies.user_auth
    const date = new Date();
    const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    let isPrivate = req.body.isPrivate || 0;
    let isNotice = req.body.isNotice || 0;
    conn.query(`select tid, userName from userTable where token = '${token}'`, (err, results) => {
        if (err) throw err;
        const name = results[0].userName
        const id = results[0].tid
        if (req.files.length === 0) { // 이미지가 들어온 게시판인가? 놉
            conn.query(`insert into contactTable(uid, title, contact, userName, upload_date, isPrivate, isNotice) value(
                    ${id},
                    '${title}',
                    '${contact}',
                    '${name}',
                    '${today}',
                    ${isPrivate},
                    ${isNotice}
                )`, (err, result) => {
                if (err) throw err;
                res.json({
                    'title': title,
                    'isPrivate': isPrivate,
                    'isNotice': isNotice
                })
            })
        }
        else { //이미지가 없네? 그럼 글만 저장하기
            let urlArr = Array()
            for (let i = 0; i < req.files.length; i++) {
                urlArr.push(`static/image/${req.files[i].filename}`);
            }
            conn.query(`insert into contactTable(uid, title, contact, userName, upload_date, isPrivate, isNotice) value(
                    ${id},
                    '${title}',
                    '${contact}',
                    '${name}',
                    '${today}',
                    ${isPrivate},
                    ${isNotice})`, (err, result) => {
                if (err) throw err;
                else { // 비어있지 않음 => 이미지 저장 해야함.
                    conn.query(`select MAX(id) as id from contactTable where id`, (err, result) => {
                        const id = result[0].id;
                        let query = Array();
                        for (let i = 0; i < urlArr.length; i++) {
                            query.push([id, urlArr[i]]);
                        }
                        if (err) throw err;
                        else {
                            conn.query('insert into imageTable(contactId, path) values ?', [query], (err, result) => {
                                if (err) throw err;
                                else {
                                    res.json({
                                        'title': title,
                                        'isPrivate': isPrivate,
                                        'isNotice': isNotice
                                    })
                                }
                            })
                        }
                    })

                }
            })
        }
    })
})

app.get('/get_contact', (req, res) => {
    const id = req.query.id;

    conn.query(`select * from contacttable where id = ${id}`, (err, result) => {
        if(err) throw err;
        const conId = result[0].id;
        const title = result[0].title;
        const contact = result[0].contact;
        const heart = result[0].heart;
        const userName = result[0].userName;
        const upload_date = result[0].upload_date;
        const isNotice = result[0].isNotice;
        const isPrivate = result[0].isPrivate;
        conn.query(`select * from imagetable where contactId = ${id}`, (err, result) => {
            if (err) throw err;
            console.log(result);
            let arr = new Array();
            for(let i = 0; i < result.length; i++) {
                arr.push('http://localhost:8080/image/' + (result[i].path).substring(13,));
            }
            if(result.length === 0) {
                res.json({
                    'id' : conId,
                    'title' : title,
                    'contactId' : contact,
                    'heart' : heart,
                    'userName' : userName,
                    'upload_date' : upload_date,
                    'isNotice' : isNotice,
                    'isPrivate' : isPrivate
                })
            } else {
                res.json({
                    'id': conId,
                    'title': title,
                    'contactId': contact,
                    'heart': heart,
                    'userName': userName,
                    'upload_date': upload_date,
                    'isNotice': isNotice,
                    'isPrivate': isPrivate,
                    'image_path' : arr
                })
            }
        })
    })
})

app.get('/heart_change', (req, res)=>{
    const heart = req.query.heart
    const id = req.query.id
    conn.query(`update contacttable set heart=${heart} where id=${id}`, (err, result)=>{
        if(err) throw err;
        else res.send(`update heart => ${heart}`)
    })
})

app.get('/popular_context', (req, res) => {
    conn.query('select * from contactTable order by heart DESC LIMIT 3', (err, results) => {
        if(err) throw err;
        res.json({
            'title1' : results[0].title,
            'title2': results[1].title,
            'title3': results[2].title
        })
    })
})

app.get('/comment_upload', (req, res) => {
    const contactId = req.query.contactId
    const token = req.cookies.user_auth
    const text = req.query.text
    conn.query(`select tid, userName from userTable where token = '${token}'`, (err, results) => {
        if (err) throw err;
        const name = results[0].userName
        const id = results[0].tid
        conn.query(`insert into commenttable(contactId, uid, userName, text) values(
            ${contactId},
            ${id},
            '${name}',
            '${text}'
            )`, (err, result) => {
                if(err) throw err;
                res.json({
                    'text': text
                })
            })
    })
})


let port = 8888;
app.listen(port, () => {
    console.log('server on! http://localhost:' + port);
});