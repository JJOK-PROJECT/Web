const express = require('express'); 
const app = express(); 
const router = express.Router();
const mongoose = require('mongoose');
const post = require('./router/post');
const cookieParser = require("cookie-parser");
  

mongoose.connect('mongodb+srv://over1122:dmswn1122!@cluster0.5mcs5.mongodb.net/cluster0?retryWrites=true&w=majority');
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function () {
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));
app.use('/upload', post);
app.use(cookieParser());

app.get('/', (req, res) => { 
        res.sendFile(__dirname + '/template/index.html'); 
    });

app.listen(8888, () => { console.log('서버 실행중...'); });
