"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commentController_1 = require("../controllers/commentController");
const authController_1 = require("../controllers/authController");
class CommentRoutes {
    constructor() {
        this._commentController = new commentController_1.CommentController();
        this._authController = new authController_1.AuthController();
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.route('/')
            .get(this._commentController.getComments)
            .post(this._authController.authentication, this._commentController.addComment);
        this.router.route('/:commentId')
            .delete(this._authController.authentication, this._commentController.deleteComment);
    }
}
exports.CommentRoutes = CommentRoutes;
const commentRoutes = new CommentRoutes();
commentRoutes.routes();
exports.default = commentRoutes.router;
//# sourceMappingURL=commentRoutes.js.map