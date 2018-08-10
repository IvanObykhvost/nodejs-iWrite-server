"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authController_1 = require("../controllers/authController");
class UserRoutes {
    constructor() {
        this._userController = new userController_1.UserController();
        this._authController = new authController_1.AuthController();
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.get('/', this._userController.getUserByToken);
        this.router.put('/', this._authController.authentication, this._userController.saveUserSetting);
        this.router.post('/register', this._userController.registerUser);
        this.router.post('/login', this._userController.login);
    }
}
exports.UserRoutes = UserRoutes;
const userRoutes = new UserRoutes();
userRoutes.routes();
exports.default = userRoutes.router;
//# sourceMappingURL=userRoutes.js.map