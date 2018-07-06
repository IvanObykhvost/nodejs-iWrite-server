const ERRORS = require('../constants').ERRORS;
const MESSAGE = require('../constants').MESSAGE;

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

FollowRepository.getFollowsByParams = (findParams) => {
    return FollowRepository.find(findParams)
        .then(follows => {
            if(follows === 0) return Promise.reject(ERRORS.NO_FOUND_FOLLOW);
            if(follows.errors) return Promise.reject(follow.errors);
            return follows;
        });
};

FollowRepository.deleteFollowByParams = (findParams) => {
    return FollowRepository.findOneAndRemove(findParams)
        .then(follow => {
            if(follow.errors) return Promise.reject(follow.errors);
            return MESSAGE.SUCCESSFULLY_REMOVED_SUBSCRIPTION;
        });
};


module.exports = FollowRepository;