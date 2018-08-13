"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../utils/validate");
const userRepository_1 = require("../repository/userRepository");
class AuthController {
    constructor() {
        this.authentication = (req, res, next) => {
            const token = req.headers.authorization;
            const { error } = this._validate.byToken(token);
            if (error)
                return this._validate.sendError(error, res);
            this._userRepository.findOneUser({ token })
                .then(user => {
                req.body.currentUser = user;
                next();
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this._validate = new validate_1.Validate();
        this._userRepository = new userRepository_1.UserRepository();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map