const UserRepository = require('../repository/userRepository');
const FollowRepository = require('../repository/followRepository');
const ERRORS = require('../constants').ERRORS;
const MESSAGE = require('../constants').MESSAGE;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function ProfileController(){
    this.getProfile = (req, res) => {
        const name = req.params.username;
        let {error} = validate.byUsername({name});
        if(error) return this.returnError(error, res);

        const token = req.headers.authorization;
        let currentUser = null;

        if(token === "null")
            return this.getProfileWithoutToken(name, res);

        UserRepository.getOneUserByParams({name})
            .then(
                user => currentUser = user, 
                error => this.returnError(error, res)
            )
            .then(
                () => this.getFollowFlag(token, currentUser, res)
            )
            .then(follow =>{
                currentUser.following = follow;
                res.send(serialize.getProfile(currentUser));
            })
            .catch(error =>
                this.returnError(error, res)
            )
    },
    this.getProfileWithoutToken = (name, res) => {
        UserRepository.getOneUserByParams({name})
            .then(
                user => {
                    user.following = false;
                    res.send(serialize.getProfile(user));
                }, 
                error => this.returnError(error, res)
            )
            .catch(error =>
                this.returnError(error, res)
            )
    },
    this.getFollowFlag = (token, user, res) => {
        return UserRepository.getOneUserByParams({token})
            .then( 
                currentUser => FollowRepository.getOneFollowByParams({
                    user: {_id : currentUser.id}, 
                    followUser: { _id : user.id} 
                }),
                error =>  this.returnError(error, res)
            )
            .then( 
                follow => follow ? true: false, 
                error => {
                    if(error === ERRORS.NO_FOUND_FOLLOW)
                        return false
                    this.returnError(error, res)
                }
            )
            .catch(error =>
                this.returnError(error, res)
            )
    },
    this.follow = (req, res) => {
        const token = req.headers.authorization;
        const name = req.params.username;
        let error = validate.byUsername({name}).error;
        if(error) return this.returnError(error, res);

        UserController.getUsersByParams({ $or: [ {token}, {name}]})
            .then(users => {
                if(users.length < 2){
                    throw ERRORS.NO_FOUND_USER;
                }
                else{
                    let sortUsers = this.sortBytoken(users, token);
                    let follow = new FollowRepository({
                        user: sortUsers[0]._id,
                        followUser: sortUsers[1]._id
                    });
                    follow.save(error => {
                        if(error) 
                            throw error;
                        else
                            res.send(serialize.success(MESSAGE.SUCCESSFULLY_SIGNED));
                    });
                }
            })
            .catch(e =>
                this.returnError(e, res)
            )
    },
    this.unfollow = (req, res) => {
        const token = req.headers.authorization;
        const name = req.params.username;
        let error = validate.byUsername({name}).error;
        if(error) return this.returnError(error, res);

        UserController.getUsersByParams({ $or: [ {token}, {name}]})
            .then(users => {
                if(users.length < 2){
                    throw ERRORS.NO_FOUND_USER;
                }
                else{
                    let sortUsers = this.sortBytoken(users, token);
                    return FollowRepository.findOneAndRemove({
                        user: {_id : sortUsers[0]._id}, 
                        followUser: { _id : sortUsers[1]._id} 
                    })
                }
            })
            .then(follow => {
                if(follow.error)
                    throw follow.error
                else
                    res.send(serialize.success(MESSAGE.SUCCESSFULLY_REMOVED_SUBSCRIPTION));
            })
            .catch(e =>
                this.returnError(e, res)
            )
    },
    this.sortBytoken = (users, token) => {
        if(users[0].token === token){
            return users;
        }
        else{
            let temp = users[0];
            users[0] = users[1];
            users[1] = temp;
            return users;
        }
    }
    this.returnError = (error, res) => {
        let message = error;
        if(error.details) {
            message = error.details[0].message;
        }
        if(error.message){
            message = error.message;
        }
        return res.send(serialize.error(message));
    }
}

module.exports = new ProfileController;