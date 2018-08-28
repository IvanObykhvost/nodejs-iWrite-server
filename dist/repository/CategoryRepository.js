"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import TagModel from "../models/Tag";
const Category_1 = require("../models/Category");
const constants_1 = require("../constants");
class CategoryRepository {
    constructor() {
        this.findCategories = (params) => {
            /*return this._model.find(params)
                .then(
                    this.returnCategories,
                    this.catchError
                )*/
            return this._model.find({ "$or": params })
                .then(this.returnCategories, this.catchError);
        };
        this.saveOneCategory = (category) => {
            return category.save()
                .then(this.returnOneCategory, this.catchError);
        };
        this.saveAllCategories = (categories) => {
            if (categories.length === 0) {
                return categories.length;
            }
            const category = categories.pop();
            return this.saveOneCategory(category)
                .then(() => this.saveAllCategories(categories));
            /*return this._model.insertMany(categories)
                .then(
                    this.returnCategories,
                    this.catchError
                );*/
        };
        this.returnOneCategory = (category) => {
            if (!category)
                return Promise.reject(constants_1.constants.errors.no_found_tag);
            return Promise.resolve(category);
        };
        this.returnCategories = (categories) => {
            if (categories.length === 0)
                return Promise.reject(constants_1.constants.errors.no_found_tag);
            return Promise.resolve(categories);
        };
        // public saveAllTags = (tags: ITag[]) => {
        //     return tags.forEach(tag => this.saveOneTag(tag));
        // }
        this.catchError = (error) => Promise.reject(error);
        this._model = Category_1.default;
    }
}
exports.CategoryRepository = CategoryRepository;
//# sourceMappingURL=CategoryRepository.js.map