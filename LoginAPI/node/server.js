const express = require('express');
const app = express();
const mongoose = require('mongoose');
const loginRouter = require('./router/LoginAPI');

app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://over1122:dmswn1122!@cluster0.5mcs5.mongodb.net/cluster0?retryWrites=true&w=majority');
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function () {
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

app.get('/', (req, res) => {
    res.render('index')//__dirname은 파일명(index.html)을 제외한 절대경로
});

app.use('/login', loginRouter);

let port = 8080;
app.listen(port, () => {
    console.log('server on! http://localhost:' + port);
});