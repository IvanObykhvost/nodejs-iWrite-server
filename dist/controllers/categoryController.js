"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../utils/validate");
const serialize_1 = require("../utils/serialize");
const CategoryRepository_1 = require("../repository/CategoryRepository");
class CategoryController {
    constructor() {
        this.addRefStoryInCategory = (params, story) => {
            //return this._categoryRepository.findCategories(params)
            return this._categoryRepository.findCategories(params)
                .then(categories => {
                categories = categories.map(category => {
                    category.stories.push(story);
                    return category;
                });
                return this._categoryRepository.saveAllCategories(categories);
            });
        };
        this.deleteRefStoryInCategory = (params, storyId) => {
            return this._categoryRepository.findCategories(params)
                .then(categories => {
                categories = categories.map(category => {
                    category.stories = category.stories.filter(id => id.toString() !== storyId);
                    return category;
                });
                return this._categoryRepository.saveAllCategories(categories);
            });
        };
        this.findCategories = (params) => {
            return this._categoryRepository.findCategories(params);
        };
        this.getAllCategories = (req, res) => {
            this._categoryRepository.findCategories([{}])
                .then(categories => res.send({
                categories: categories.map(category => this._serialize.getCategory(category)),
            }))
                .catch(e => this._validate.sendError(e, res));
        };
        this._validate = new validate_1.Validate();
        this._serialize = new serialize_1.Serialize();
        this._categoryRepository = new CategoryRepository_1.CategoryRepository();
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=CategoryController.js.map