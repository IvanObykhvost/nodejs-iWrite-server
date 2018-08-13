"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../utils/validate");
const serialize_1 = require("../utils/serialize");
const userRepository_1 = require("../repository/userRepository");
const constants_1 = require("../constants");
class ProfileController {
    constructor() {
        this.getProfile = (req, res) => {
            const name = req.params.username;
            const { error } = this._validate.byUsername({ name });
            if (error)
                return this._validate.sendError(error, res);
            const token = req.headers.authorization;
            let currentUser;
            if (token === "null")
                return this.getProfileWithoutToken(name, res);
            this._userRepository.findOneUser({ name })
                .then(user => {
                currentUser = user;
                return this._userRepository.getOneFollowingFlag(token, currentUser.id);
            })
                .then(following => {
                currentUser.following = following;
                res.send(this._serialize.getProfile(currentUser));
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this.getProfileWithoutToken = (name, res) => {
            this._userRepository.findOneUser({ name })
                .then(user => res.send(this._serialize.getProfile(user)))
                .catch(e => this._validate.sendError(e, res));
        };
        this.follow = (req, res) => {
            this.addOrDeleteFollow(req, res, constants_1.constants.operation.add_follower);
        };
        this.unfollow = (req, res) => {
            this.addOrDeleteFollow(req, res, constants_1.constants.operation.delete_follower);
        };
        this.addOrDeleteFollow = (req, res, action) => {
            const token = req.headers.authorization;
            const name = req.params.username;
            const { error } = this._validate.byUsername({ name });
            if (error)
                return this._validate.sendError(error, res);
            this._userRepository.findUsers({ $or: [{ token }, { name }] })
                .then(users => {
                if (users.length < 2)
                    throw constants_1.constants.errors.no_found_user;
                let sortUsers = this.sortByToken(users, token);
                if (action === constants_1.constants.operation.add_follower) {
                    sortUsers[0].followings.push(sortUsers[1]);
                    sortUsers[1].followers.push(sortUsers[0]);
                }
                else {
                    sortUsers[0].followings.filter(el => el !== sortUsers[1]);
                    sortUsers[1].followers.filter(el => el !== sortUsers[0]);
                }
                return this._userRepository.findUsers(sortUsers);
            })
                .then(() => res.send(constants_1.constants.message.successfully_signed))
                .catch(e => this._validate.sendError(e, res));
        };
        this.sortByToken = (users, token) => {
            if (users[0].token === token) {
                return users;
            }
            else {
                let temp = users[0];
                users[0] = users[1];
                users[1] = temp;
                return users;
            }
        };
        this.getFollowers = (req, res) => {
            const name = req.params.username;
            const { error } = this._validate.byUsername({ name });
            if (error)
                return this._validate.sendError(error, res);
            const aggregate = {
                limit: req.query.limit,
                offset: req.query.offset
            };
            this._userRepository.findOneUser({ name })
                .then(user => {
                if (user.followers.length === 0)
                    throw constants_1.constants.errors.no_found_followers;
                let count = user.followers.length;
                user.followers = user.followers.slice(Number(aggregate.offset), Number(aggregate.offset) + Number(aggregate.limit));
                user.followers = user.followers.map(follower => {
                    follower.following = user.followings.some(el => el.id === follower.id);
                    return follower;
                });
                res.send({
                    followers: user.followers.map(user => this._serialize.getFollower(user)),
                    count
                });
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this.getFollowing = (req, res) => {
            const name = req.params.username;
            const { error } = this._validate.byUsername({ name });
            if (error)
                return this._validate.sendError(error, res);
            const aggregate = {
                limit: req.query.limit,
                offset: req.query.offset
            };
            this._userRepository.findOneUser({ name })
                .then(user => {
                if (user.followings.length === 0)
                    throw constants_1.constants.errors.no_found_followings;
                let count = user.followings.length;
                user.followings = user.followings.slice(Number(aggregate.offset), Number(aggregate.offset) + Number(aggregate.limit));
                user.followings = user.followings.map(follower => {
                    follower.following = true;
                    return follower;
                });
                res.send({
                    followers: user.followings.map(user => this._serialize.getFollower(user)),
                    count
                });
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this._validate = new validate_1.Validate();
        this._serialize = new serialize_1.Serialize();
        this._userRepository = new userRepository_1.UserRepository();
    }
}
exports.ProfileController = ProfileController;
//# sourceMappingURL=profileController.js.map