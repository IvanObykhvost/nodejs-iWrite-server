const UserRepository = require('../repository/userRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function ProfileController(){
    this.getProfile = (req, res) => {
        const name = req.params.username;
        let {error} = validate.byUsername({name});
        if(error) return validate.sendError(error, res);

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
                () => UserRepository.getFollowFlag(token, currentUser.id, res)
            )
            .then(follow =>{
                currentUser.following = follow;
                res.send(serialize.getProfile(currentUser));
            })
            .catch(e => validate.sendError(e, res));
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
            .catch(e => validate.sendError(e, res));
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
        if(error) return validate.sendError(error, res);

        UserRepository.getUsersByParams({ $or: [{token}, {name}]})
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
            .catch(e => validate.sendError(e, res));
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
    },
    this.getFollowers = (req, res) => {
        const name = req.params.username;
        let aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };
        UserRepository.getOneUserByParams({name})
            .then(
                user => UserRepository.getUsersByParams({follows: user.id}),
                error =>  {throw error}
            )
            .then(
                users => {
                    let count = users.length;
                    users = users.slice(
                        Number(aggregate.offset), Number(aggregate.offset)+Number(aggregate.limit)
                    );
                    res.send({
                        followers: users.map(user => serialize.getFollower(user)),
                        count
                    })
                },
                error =>  {
                    if(error === constants.ERRORS.NO_FOUND_USER)
                        error = constants.ERRORS.NO_FOUND_FOLLOWS;
                    throw error
                }
            )
            .catch(e => validate.sendError(e, res));
        
    },
    this.getFollowing = (req, res) => {
        const name = req.params.username;
        let aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };
        UserRepository.getOneUserByParams({name})
            .then(
                user => {
                    let count = user.follows.length;
                    user.follows = user.follows.slice(
                        Number(aggregate.offset), Number(aggregate.offset)+Number(aggregate.limit)
                    );
                    res.send({
                        followers: user.follows.map(follow => serialize.getFollower(follow)),
                        count
                    })
                },
                error =>  {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }

}

module.exports = new ProfileController;