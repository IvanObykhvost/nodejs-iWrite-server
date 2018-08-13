"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = require("../models/Tag");
const constants_1 = require("../constants");
class TagRepository {
    constructor() {
        this.createNewTag = (params) => {
            const model = new this._model(params);
            return model;
        };
        this.getPopularTags = () => {
            const tags = this._model
                .aggregate([{
                    '$match': {
                        'popular': { '$gte': 1 }
                    }
                }])
                .sort({ popular: 'desc', text: 'asc' })
                .limit(20)
                .exec();
            return Promise.resolve(tags)
                .then(this.returnTags, this.catchError);
        };
        this.findOneTag = (params) => {
            return this._model.findOne(params)
                .then(this.returnOneTag, this.catchError);
        };
        this.findTags = (params) => {
            return this._model.find(params)
                .then(this.returnTags, this.catchError);
        };
        this.saveOneTag = (tag) => {
            return tag.save()
                .then(this.returnOneTag, this.catchError);
        };
        this.saveAllTags = (tags) => {
            return tags.forEach(tag => this.saveOneTag(tag));
        };
        this.insertAllTags = (tags) => {
            return this._model.insertMany(tags)
                .then(this.returnTags, this.catchError);
        };
        this.createNewTagsAndSaveAll = (tags, postId) => {
            //inProgress
        };
        this.deleteRefPostInTag = (params, postId) => {
            // return this.findTags(params)
            //     .then(
            //         tags => {
            //             tags = tags.map(tag => {
            //                 tag.popular -=1;
            //                 tag.post = tag.post.
            //             })
            //         },
            //         this.catchError
            //     )
            //     .then(
            //         this.returnTags,
            //         this.catchError
            //     )
        };
        this.returnOneTag = (tag) => {
            if (!tag)
                return Promise.reject(constants_1.constants.errors.no_found_tag);
            return Promise.resolve(tag);
        };
        this.returnTags = (tags) => {
            if (tags.length === 0)
                return Promise.reject(constants_1.constants.errors.no_found_tag);
            return Promise.resolve(tags);
        };
        this.catchError = (error) => Promise.reject(error);
        this._model = Tag_1.default;
    }
}
exports.TagRepository = TagRepository;
//# sourceMappingURL=tagRepository.js.map