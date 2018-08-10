"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("../controllers/userController");
class Routes {
    constructor() {
        this._userController = new userController_1.UserController();
    }
    routes(app) {
        app.route('/user')
            .get(this._userController.getUserByToken);
        // app.route('/api/user/login')
        //     .post(this._userController.login);
    }
}
exports.Routes = Routes;
//# sourceMappingURL=routes.js.map