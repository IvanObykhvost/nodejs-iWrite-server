"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const constants_1 = require("../constants");
const bcrypt = require('bcrypt-nodejs');
class UserRepository {
    constructor() {
        this.createNewModel = (params) => {
            const model = new this._model(params);
            let user = model;
            user.password = bcrypt.hashSync(user.password);
            return user;
        };
        this.findOneUser = (params) => {
            return this._model.findOne(params)
                .then(this.returnOneUser, this.catchError);
        };
        this.findUsers = (params) => {
            return this._model.find(params)
                .then(this.returnUsers, this.catchError);
        };
        this.updateOneUser = (params, user) => {
            return this._model.findOneAndUpdate(params, user, { new: true })
                .then(this.returnOneUser, this.catchError);
        };
        this.saveOneUser = (user) => {
            return user.save()
                .then(this.returnOneUser, this.catchError);
        };
        this.saveAllUser = (users) => {
            return this._model.insertMany(users)
                .then(this.findUsers, this.catchError);
        };
        this.getOneFollowingFlag = (token, id) => {
            return this.findOneUser({ token })
                .then(user => user.followings.some(el => el.id === id), this.catchError);
        };
        this.returnOneUser = (user) => {
            if (!user)
                return Promise.reject(constants_1.constants.errors.no_found_user);
            return Promise.resolve(user);
        };
        this.returnUsers = (users) => {
            if (users.length === 0)
                return Promise.reject(constants_1.constants.errors.no_found_user);
            return Promise.resolve(users);
        };
        this.catchError = (error) => Promise.reject(error);
        this._model = User_1.default;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=userRepository.js.map