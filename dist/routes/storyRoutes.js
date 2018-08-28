"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const storyController_1 = require("../controllers/storyController");
class StoryRoutes {
    constructor() {
        //this._postController = new PostController();        
        this._authController = new authController_1.AuthController();
        //this._commentController = new CommentController()
        this._storyController = new storyController_1.StoryController();
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.post('/', this._authController.authentication, this._storyController.addNewStory);
        this.router.route('/:id')
            .get(this._storyController.getOneStory)
            .put(this._authController.authentication, this._storyController.updateStory);
        //.delete(this._authController.authentication, this._postController.deletePost)
    }
}
exports.StoryRoutes = StoryRoutes;
const storyRoutes = new StoryRoutes();
storyRoutes.routes();
exports.default = storyRoutes.router;
//# sourceMappingURL=storyRoutes.js.map