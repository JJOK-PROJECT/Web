const bcrypt = require('bcrypt');

const pwd = bcrypt.hashSync('1234', 10);
console.log(pwd);