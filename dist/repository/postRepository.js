"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = require("../models/Post");
const constants_1 = require("../constants");
class PostRepository {
    constructor() {
        this.findPostsWithPagination = (params, aggregate) => {
            const request = this._model
                .find(params)
                .sort('-createdAt')
                .skip(aggregate.offset)
                .limit(aggregate.limit)
                .exec();
            return Promise.resolve(request)
                .then(this.returnPosts, this.catchError);
        };
        this.findOnePost = (params) => {
            return this._model.findOne(params)
                .then(this.returnOnePost, this.catchError);
        };
        this.findPosts = (params) => {
            return this._model.find(params)
                .then(this.returnPosts, this.catchError);
        };
        this.updateOnePost = (params, currentPost) => {
            return this._model.findOneAndUpdate(params, currentPost, { new: true })
                .then(this.returnOnePost, this.catchError);
        };
        this.saveOnePost = (currentPost) => {
            return currentPost.save()
                .then(this.returnOnePost, this.catchError);
        };
        this.removeOnePost = (currentPost) => {
            return currentPost.remove()
                .then(this.returnOnePost, this.catchError);
        };
        this.returnOnePost = (post) => {
            if (!post)
                return Promise.reject(constants_1.constants.errors.no_found_post);
            return Promise.resolve(post);
        };
        this.returnPosts = (posts) => {
            if (posts.length === 0)
                return Promise.reject(constants_1.constants.errors.no_found_post);
            return Promise.resolve(posts);
        };
        this.catchError = (error) => Promise.reject(error);
        this._model = Post_1.default;
    }
    createNewPost(params) {
        const model = new this._model(params);
        return model;
    }
}
exports.PostRepository = PostRepository;
//# sourceMappingURL=postRepository.js.map