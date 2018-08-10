"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const constants_1 = require("../constants");
const bcrypt = require('bcrypt-nodejs');
class UserRepository {
    constructor() {
        this.returnOneUser = (user) => {
            if (!user)
                return Promise.reject(constants_1.constants.errors.no_found_user);
            return Promise.resolve(user);
        };
        this.catchError = (error) => Promise.reject(error);
        this._model = User_1.default;
    }
    createNewModel(params) {
        const model = new this._model(params);
        let user = model;
        user.password = bcrypt.hashSync(user.password);
        return user;
    }
    findOneUser(params) {
        return this._model.findOne(params)
            .then(this.returnOneUser, this.catchError);
    }
    updateOneUser(params, user) {
        return this._model.findOneAndUpdate(params, user, { new: true })
            .then(this.returnOneUser, this.catchError);
    }
    saveOneUser(user) {
        return user.save()
            .then(this.returnOneUser, this.catchError);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=userRepository.js.map