const UserRepository = require('../repository/userRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

class ProfileController {
    
    getProfile(req, res) {
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
                () => UserRepository.getOneFollowingFlag(token, currentUser.id, res)
            )
            .then(follow =>{
                currentUser.following = follow;
                res.send(serialize.getProfile(currentUser));
            })
            .catch(e => validate.sendError(e, res));
    }

    getProfileWithoutToken(name, res) {
        UserRepository.getOneUserByParams({name})
            .then(
                user => res.send(serialize.getProfile(user)), 
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }

    follow(req, res) {
        this.addOrDeleteFollow(req, res, constants.OPERATION.ADD_FOLLOWER)
    }

    unfollow(req, res) {
        this.addOrDeleteFollow(req, res, constants.OPERATION.DELETE_FOLLOW)
    }

    addOrDeleteFollow(req, res, action) {
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

                        if(action === constants.OPERATION.ADD_FOLLOWER){
                            sortUsers[0].followings.push(sortUsers[1].id);
                            sortUsers[1].followers.push(sortUsers[0].id);
                        }
                        else{
                            sortUsers[0].followings.pull(sortUsers[1].id);
                            sortUsers[1].followers.pull(sortUsers[0].id);
                        }
                        return UserRepository.saveAllUsers(sortUsers, sortUsers.length);
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
    }

    getFollowers(req, res) {
        const name = req.params.username;
        const aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };
        UserRepository.getOneUserByParams({name})
            .then(
                user => {
                    if(!user.followers.length) return Promise.reject(constants.ERRORS.NO_FOUND_FOLLOWERS);

                    let count = user.followers.length;
                    user.followers = user.followers.slice(
                        Number(aggregate.offset), Number(aggregate.offset)+Number(aggregate.limit)
                    );
                    user.followers = user.followers.map(follower => {
                        follower.following = user.followings.some(el => el.id === follower.id);
                        return follower;
                    });
                    res.send({
                        followers: user.followers.map(user => serialize.getFollower(user)),
                        count
                    })
                },
                error =>  {throw error}
            )
            .catch(e => validate.sendError(e, res));
        
    }

    getFollowing(req, res) {
        const name = req.params.username;
        const aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };
        UserRepository.getOneUserByParams({name})
            .then(
                user => {
                    const count = user.followings.length;
                    user.followings = user.followings.slice(
                        Number(aggregate.offset), Number(aggregate.offset)+Number(aggregate.limit)
                    );
                    user.followings = user.followings.map(follow => {
                        follow.following = true;
                        return follow;
                    });
                    res.send({
                        followers: user.followings.map(follower => serialize.getFollower(follower)),
                        count
                    })
                },
                error =>  {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }

    static sortByToken (users, token) {
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
}

module.exports = new ProfileController();