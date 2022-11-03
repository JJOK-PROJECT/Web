var express = require('express')
var app = express()
app.use(express.static(__dirname + '/public'));

var port = 8080;

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
})

app.listen(port, function () {
    console.log('contacting sever...');
})