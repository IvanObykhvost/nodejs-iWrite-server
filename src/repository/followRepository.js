var mongoose = require('mongoose');
var url = "mongodb://127.0.0.1:27017/node";

mongoose.connect(url, (error) => {
    if(error) console.log(error);
    else console.log("FollowRepository connected");
});

const FollowSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    followUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }    
});

FollowSchema.pre('find', function() {
    this.populate('user');
});

const FollowRepository = mongoose.model('follow', FollowSchema);

module.exports = FollowRepository;