const express = require('express');
const http = require("http");
const app = express();
const view = require('./router/view')
const schedule = require('./router/schedule')
const meal = require('./router/meal')
const community = require('./router/community')
const tip = require('./router/tip')
const hot_advice = require('./router/hot_advice')
const signup = require('./router/signup')
const register = require('./router/register')
const server = http.createServer(app);
const port = 8080;
const hostname = '127.0.0.1';
const ejs = require("ejs"); 

app.set('view engine', 'ejs'); 
app.set('views', './views');
app.use('/static', express.static('static'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/view', view);
app.use('/schedule', schedule);
app.use('/meal', meal);
app.use('/community', community);
app.use('/tip', tip);
app.use('/hot_advice', hot_advice);
app.use('/signup', signup);
app.use('/register', register);


app.get('/', (req, res) => {
    res.render('index');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});