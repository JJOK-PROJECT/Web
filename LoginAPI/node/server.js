const express = require('express');
const app = express();
const loginRouter = require('./router/LoginAPI');
const imageRouter = require('./router/image');
const cookieParser = require("cookie-parser");

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
app.use('/login', loginRouter);

let port = 8888;
app.listen(port, () => {
    console.log('server on! http://localhost:' + port);
});