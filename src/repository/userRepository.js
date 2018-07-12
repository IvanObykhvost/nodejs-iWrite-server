const constants = require('../constants');

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
    follows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    }]
});

UserSchema.pre('findOne', function() {
    this.populate('follows');
    this.populate('favorites');
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
},

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
UserRepository.getFollowFlag = (token, id) => {
    return UserRepository.getOneUserByParams({token})
        .then( 
            currentUser => {
                return currentUser.follows.some(el => {
                    if(el.id === id)
                        return true;
                    return false;
                })
            },
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

UserRepository.removeFavoriteFromUsers = (findParams) => {
    return UserRepository.getUsersByParams(findParams)
        .then(
            users => {
                users = users.map(user => {
                    user.favorites.pull(findParams.favorites);
                    return user;
                });
                return UserRepository.saveAllUsers(users, users.length);
            },
            error => {
                if(error === constants.ERRORS.NO_FOUND_USER)
                    return constants.MESSAGE.SUCCESSFULLY_REMOVED_FAVORITE 
                throw error
            }
        )
        .then(message => message)
        .catch(e => Promise.reject(e))
}

UserRepository.saveAllUsers = (users, length) => {
    if(length === 0)
        return constants.MESSAGE.SUCCESSFULLY_REMOVED_FAVORITE;
    let user = users.pop();
    return UserRepository.saveOneUser(user)
        .then(
            user => UserRepository.saveAllUsers(users, --length),
            error => Promise.reject(error)
        )
}



module.exports = UserRepository;