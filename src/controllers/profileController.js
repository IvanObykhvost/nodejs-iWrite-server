const UserRepository = require('../repository/userRepository');
const constants = require('../constants');
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
                error => {throw error}
            )
            .then(
                () => UserRepository.getFollowFlag(token, currentUser, res)
            )
            .then(follow =>{
                currentUser.following = follow;
                res.send(serialize.getProfile(currentUser));
            })
            .catch(e =>
                this.returnError(e, res)
            )
    },
    this.getProfileWithoutToken = (name, res) => {
        UserRepository.getOneUserByParams({name})
            .then(
                user => {
                    user.following = false;
                    res.send(serialize.getProfile(user));
                }, 
                error => {throw error}
            )
            .catch(e =>
                this.returnError(e, res)
            )
    },
    this.follow = (req, res) => {
        this.addOrDeleteFollow(req, res, constants.OPERATION.ADD_FOLLOW)
    },
    this.unfollow = (req, res) => {
        this.addOrDeleteFollow(req, res, constants.OPERATION.DELETE_FOLLOW)
    },
    this.addOrDeleteFollow = (req, res, action) => {
        const token = req.headers.authorization;
        const name = req.params.username;
        let error = validate.byUsername({name}).error;
        if(error) return this.returnError(error, res);

        UserRepository.getUsersByParams({ $or: [ {token}, {name}]})
            .then(users => {
                    if(users.length < 2){
                        throw constants.ERRORS.NO_FOUND_USER;
                    }
                    else{
                        let sortUsers = this.sortByToken(users, token);

                        if(action === constants.OPERATION.ADD_FOLLOW)
                            sortUsers[0].follows.push(sortUsers[1].id);
                        else
                            sortUsers[0].follows.pull(sortUsers[1].id);

                        return sortUsers[0].save();
                    }
                },
                error =>  {throw error}
            )
            .then(user => {
                    if(user.errors) 
                        throw user.errors;
                    else
                        res.send(serialize.success(constants.MESSAGE.SUCCESSFULLY_SIGNED));
                }
            )
            .catch(e =>
                this.returnError(e, res)
            )
    },
    this.sortByToken = (users, token) => {
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
        res.send(serialize.error(message));
    }
}

module.exports = new ProfileController;