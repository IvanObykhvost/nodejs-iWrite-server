"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Story_1 = require("../models/Story");
const constants_1 = require("../constants");
class StoryRepository {
    constructor() {
        this.saveOneStory = (currentStory) => {
            return currentStory.save()
                .then(this.returnOneStory, this.catchError);
        };
        this.findOneStory = (params) => {
            return this._model.findOne(params)
                .then(this.returnOneStory, this.catchError);
        };
        this.updateOneStory = (params, currentPost) => {
            return this._model.findOneAndUpdate(params, currentPost, { new: true })
                .then(this.returnOneStory, this.catchError);
        };
        this.returnOneStory = (story) => {
            if (!story)
                return Promise.reject(constants_1.constants.errors.no_found_post);
            return Promise.resolve(story);
        };
        this.catchError = (error) => Promise.reject(error);
        this._model = Story_1.default;
    }
    createNewStory(params) {
        const model = new this._model(params);
        return model;
    }
}
exports.StoryRepository = StoryRepository;
//# sourceMappingURL=storyRepository.js.map