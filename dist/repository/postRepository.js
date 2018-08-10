"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = require("../models/Post");
const constants_1 = require("../constants");
class PostRepository {
    constructor() {
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
    findOnePost(params) {
        return this._model.findOne(params)
            .then(post => {
            if (!post)
                return Promise.reject(constants_1.constants.errors.no_found_post);
            return Promise.resolve(post);
        }, this.catchError);
    }
    findPosts(params) {
        return this._model.find(params)
            .then(this.returnPosts, this.catchError);
    }
    saveOnePost(currentUser) {
        return currentUser.save()
            .then(this.returnOnePost, this.catchError);
    }
}
exports.PostRepository = PostRepository;
//# sourceMappingURL=postRepository.js.map