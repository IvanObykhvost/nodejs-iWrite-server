"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userRepository_1 = require("../repository/userRepository");
const validate_1 = require("../utils/validate");
const serialize_1 = require("../utils/serialize");
const generateToken_1 = require("../utils/generateToken");
const constants_1 = require("../constants");
const bcrypt = require('bcrypt-nodejs');
const generate = new generateToken_1.Generate();
class UserController {
    constructor() {
        this.getUserByToken = (req, res) => {
            const token = req.headers.authorization;
            const { error } = this._validate.byToken(token);
            if (error)
                return this._validate.sendError(error, res);
            this._userRepository.findOneUser({ token })
                .then(user => {
                res.send(this._serialize.getUser(user));
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this.registerUser = (req, res) => {
            const { error } = this._validate.byRegister(req.body);
            if (error)
                return this._validate.sendError(error, res);
            this._userRepository.findOneUser({ email: req.body.email })
                .then(() => Promise.reject(constants_1.constants.errors.email_already), error => {
                if (error === constants_1.constants.errors.no_found_user) {
                    return this._userRepository.findOneUser({ name: req.body.name });
                }
                throw error;
            })
                .then(() => Promise.reject(constants_1.constants.errors.username_already_use), error => {
                if (error === constants_1.constants.errors.no_found_user) {
                    const user = this._userRepository.createNewModel(req.body);
                    return this._userRepository.saveOneUser(user);
                }
                throw error;
            })
                .then(user => res.send({
                user: this._serialize.getUser(user),
                success: constants_1.constants.message.successfully_login
            }))
                .catch(e => this._validate.sendError(e, res));
        };
        this.login = (req, res) => {
            const { error } = this._validate.byLogin(req.body);
            if (error)
                return this._validate.sendError(error, res);
            this._userRepository.findOneUser({ email: req.body.email })
                .then(user => {
                const comparePass = bcrypt.compareSync(req.body.password, user.password);
                if (comparePass) {
                    user.token = generate.getToken();
                    return this._userRepository.saveOneUser(user);
                }
                throw constants_1.constants.errors.invalid_credentials;
            })
                .then(user => res.send({
                user: this._serialize.getUser(user).user,
                success: constants_1.constants.message.successfully_login
            }))
                .catch(e => this._validate.sendError(e, res));
        };
        this.saveUserSetting = (req, res) => {
            const token = req.headers.authorization;
            const settingsUser = this._serialize.getSettings(req.body.user);
            const { error } = this._validate.byUpdateUser(settingsUser);
            if (error)
                return this._validate.sendError(error, res);
            this._userRepository.findOneUser({ email: settingsUser.email })
                .then(user => {
                if (user.token !== token)
                    throw constants_1.constants.errors.email_already;
                return this._userRepository.findOneUser({ name: settingsUser.name });
            }, error => {
                if (error === constants_1.constants.errors.no_found_user)
                    return this._userRepository.findOneUser({ name: settingsUser.name });
                throw error;
            })
                .then(user => {
                if (user.token !== token)
                    throw constants_1.constants.errors.username_already_use;
                return this._userRepository.updateOneUser({ token }, settingsUser);
            }, error => {
                if (error === constants_1.constants.errors.no_found_user)
                    return this._userRepository.updateOneUser({ token }, settingsUser);
                throw error;
            })
                .then(user => res.send({
                user: this._serialize.getUser(user).user,
                success: constants_1.constants.message.succesfully_updated_user
            }), error => { throw error; })
                .catch(e => this._validate.sendError(e, res));
        };
        this._userRepository = new userRepository_1.UserRepository();
        this._validate = new validate_1.Validate();
        this._serialize = new serialize_1.Serialize();
    }
    addNewUser(req, res) {
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map