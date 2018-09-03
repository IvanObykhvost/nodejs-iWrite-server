"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialize_1 = require("../utils/serialize");
const validate_1 = require("../utils/validate");
const constants_1 = require("../constants");
const storyRepository_1 = require("../repository/storyRepository");
const CategoryController_1 = require("../controllers/CategoryController");
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
        this._storyRepository = new storyRepository_1.StoryRepository();
        this._categoryController = new CategoryController_1.CategoryController();
    }
}
exports.StoryController = StoryController;
//# sourceMappingURL=storyController.js.map