var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/template/view.html');
});

module.exports = router;