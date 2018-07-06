const ERRORS = require('../constants').ERRORS;

const mongoose = require('mongoose');
const url = "mongodb://127.0.0.1:27017/node";
const option = { 
    useNewUrlParser: true 
}

mongoose.connect(url, option, (error) => {
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
    this.populate('followUser');
});

const FollowRepository = mongoose.model('follows', FollowSchema);

FollowRepository.getOneFollowByParams = (findParams) => {
    return FollowRepository.findOne(findParams)
        .then(follow => {
            if(!follow) return Promise.reject(ERRORS.NO_FOUND_FOLLOW);
            if(follow.errors) return Promise.reject(follow.errors);
            return follow;
        });
};


module.exports = FollowRepository;