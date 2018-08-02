const constants = require('../constants');
const PostRepository = require('./postRepository');

const mongoose = require('mongoose');
const url = "mongodb://127.0.0.1:27017/node";
const generate = require('../utils/genarateToken').Generate;
const option = { 
    useNewUrlParser: true 
}

mongoose.connect(url, option, (error) => {
    if(error) console.log(error);
    else console.log("Connected with DB");
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
    following: {type: Boolean, required: false},
    followings: [{ //ты подписался на других
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    followers: [{ //это подписаны на тебя
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    }],
    postCount: {type: Number, default: 0}
},
{
    versionKey: false
});

UserSchema.pre('findOne', function(next) {
    this.populate('followers');
    this.populate('followings');
    this.populate('favorites');
    next();
});


UserSchema.pre('findOneAndUpdate', function(next) {
    this.update({}, {updatedAt: new Date()});
    next();
});

const UserRepository = mongoose.model('users', UserSchema);

/**
* Use by look for user
* @method  getOneUserByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @returns {Object} user or error
*/
UserRepository.getOneUserByParams = (findParams) => {
    return UserRepository.findOne(findParams)
        .then(user => {
            if(!user) return Promise.reject(constants.ERRORS.NO_FOUND_USER)
            if(user.errors) return Promise.reject(user.errors);
            return user;
        });
};

/**
* Use by looking for many users
* @method  getUsersByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @return {Array[Objects]} users or error
*/
UserRepository.getUsersByParams = (findParams) => {
    return UserRepository.find(findParams)
        .then(users => {
            if(users.length === 0) return Promise.reject(constants.ERRORS.NO_FOUND_USER)
            if(users.errors) return Promise.reject(users.errors);
            return users;
        });
};

UserRepository.getUsersPaginationByParams = (findParams, aggregate) => {
    let request = UserRepository
        .find(findParams)
        .sort('-name')
        .skip(Number(aggregate.offset))
        .limit(Number(aggregate.limit))
        .exec();

    return request
        .then(users => {
            if(!users.length) return Promise.reject(constants.ERRORS.NO_FOUND_USER);
            if(users.errors) return Promise.reject(users.errors);
            return users;
        })
}

/**
* Update one user by params
* @method  updateOneUser
* @param {Object, Object} findParams object by find {name : 'Jack'}, update - user.
* @return {Objects} user or error
*/
UserRepository.updateOneUser = (findParams, user) => {
    return UserRepository.findOneAndUpdate(findParams, user, { new: true })
        .then(user => {
            if(!user) return Promise.reject(constants.ERRORS.NO_FOUND_USER)
            if(user.errors) return Promise.reject(user.errors);
            return user;
        });
};

/**
* get true if follow user is
* @method  getFollowFlag
* @param {String, ObjectId} token 
* @return {Bool} true or false or error
*/
UserRepository.getOneFollowingFlag = (token, id) => {
    return UserRepository.getOneUserByParams({token})
        .then( 
            currentUser => currentUser.followings.some(el => el.id === id),
            error => Promise.reject(error)
        )
}

UserRepository.saveOneUser = (user) => {
    return user.save()
        .then(user => {
            if(!user) return Promise.reject(constants.ERRORS.NO_FOUND_USER)
            if(user.errors) return Promise.reject(user.errors);
            return user;
        });
}

UserRepository.saveAllUsers = (users, length) => {
    if(!length)
        return constants.MESSAGE.SUCCESSFULLY_REMOVED_FAVORITE;
    let user = users.pop();
    return UserRepository.saveOneUser(user)
        .then(
            () => UserRepository.saveAllUsers(users, --length),
            error => Promise.reject(error)
        )
}


module.exports = UserRepository;