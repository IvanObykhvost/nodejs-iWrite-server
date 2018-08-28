"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tagController_1 = require("../controllers/tagController");
const serialize_1 = require("../utils/serialize");
const validate_1 = require("../utils/validate");
const constants_1 = require("../constants");
const userController_1 = require("./userController");
const userRepository_1 = require("../repository/userRepository");
const tagRepository_1 = require("../repository/tagRepository");
const commentRepository_1 = require("../repository/commentRepository");
const storyRepository_1 = require("../repository/storyRepository");
const CategoryController_1 = require("../controllers/CategoryController");
const categoryRepository_1 = require("../repository/categoryRepository");
class StoryController {
    constructor() {
        this.addNewStory = (req, res) => {
            const { body, currentUser } = this._serialize.getCurrentUserFromBody(req.body);
            //const {error} = this._validate.byStory(body);
            //if(error) {
            //    return this._validate.sendError(error, res);
            //}
            let newStory = this._serialize.setNewStory(body, currentUser);
            let newStoryModel = this._storyRepository.createNewStory(Object.assign({}, newStory));
            let currentStory;
            this._storyRepository.saveOneStory(newStoryModel)
                .then(story => {
                currentStory = story;
                return this._categoryController.addRefStoryInCategory(newStory.categories, story);
            })
                .then(() => res.send({
                story: this._serialize.getStory(currentStory),
                success: constants_1.constants.message.successfully_added
            }))
                .catch(e => this._validate.sendError(e, res));
        };
        this.updateStory = (req, res) => {
            //const {error: errorId} = this._validate.byId(req.params);
            //if(errorId) return this._validate.sendError(errorId, res);
            let { body, currentUser } = this._serialize.getCurrentUserFromBody(req.body);
            let updateStory = this._serialize.setUpdateStory(body);
            let currentStory;
            /*const {error} = this._validate.byUpdatePost(updatePost);
            if(error) return this._validate.sendError(error, res);*/
            this._storyRepository.findOneStory({ _id: updateStory.id })
                //detach story form categories
                .then(story => this._categoryController.deleteRefStoryInCategory(story.categories, story.id))
                //update story
                .then(() => this._storyRepository.updateOneStory({ _id: updateStory.id }, updateStory))
                //add story ref to category(ies)
                .then(story => {
                currentStory = story;
                return this._categoryController.addRefStoryInCategory(updateStory.categories, story);
            })
                .then(() => res.send({
                story: this._serialize.getStory(currentStory),
                success: constants_1.constants.message.succesfully_updated_post
            }))
                .catch(e => this._validate.sendError(e, res));
        };
        this.getOneStory = (req, res) => {
            const id = req.params.id;
            const { error } = this._validate.byId({ id });
            if (error)
                return this._validate.sendError(error, res);
            this._storyRepository.findOneStory({ _id: id })
                .then(story => res.send({ story: this._serialize.getStory(story) }))
                .catch(e => this._validate.sendError(e, res));
        };
        this._validate = new validate_1.Validate();
        this._serialize = new serialize_1.Serialize();
        //this._postRepository = new PostRepository();
        this._storyRepository = new storyRepository_1.StoryRepository();
        this._categoryRepository = new categoryRepository_1.CategoryRepository();
        this._userRepository = new userRepository_1.UserRepository();
        this._tagRepository = new tagRepository_1.TagRepository();
        this._commentRepository = new commentRepository_1.CommentRepository();
        this._tagController = new tagController_1.TagController();
        this._userController = new userController_1.UserController();
        this._categoryController = new CategoryController_1.CategoryController();
    }
}
exports.StoryController = StoryController;
//# sourceMappingURL=storyController.js.map