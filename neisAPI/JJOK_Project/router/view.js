var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('view.html');;
});

module.exports = router;