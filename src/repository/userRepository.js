var mongoose = require('mongoose');
var url = "mongodb://127.0.0.1:27017/node";
const Generate = require('../utils/genarateToken').Generate;
let generate = new Generate();

mongoose.connect(url, (error) => {
    if(error) console.log(error);
    else console.log("UserController connected");
})

const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    bio: {type: String, default: ''},
    image: {type: String, default: ''},
    token: {type: String, default: generate.token()},
});

const UserRepository = mongoose.model('users', UserSchema);

module.exports = UserRepository;