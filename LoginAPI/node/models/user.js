var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type: String, required: true, trim: true, unique: true },
    userid: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    },
    {
        timestamp: true
    });

userSchema.pre("save", async function () {
    console.log("Users password:", this.password);
    this.password = await bcrypt.hash(this.password, 5);
    console.log("Hashed password:", this.password);
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}

const User = mongoose.model('users', userSchema);
module.exports = User;