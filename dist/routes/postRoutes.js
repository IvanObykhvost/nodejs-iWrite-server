"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
class UserRoutes {
    constructor() {
        this._postController = new postController_1.PostController();
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.get('/posts', this._postController.getAllPosts);
    }
}
exports.UserRoutes = UserRoutes;
const userRoutes = new UserRoutes();
userRoutes.routes();
exports.default = userRoutes.router;
//# sourceMappingURL=postRoutes.js.map