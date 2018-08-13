"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Comment_1 = require("../models/Comment");
const constants_1 = require("../constants");
class CommentRepository {
    constructor() {
        this.createNewModel = (params) => {
            const model = new this._model(params);
            return model;
        };
        this.findOneComment = (params) => {
            return this._model.findOne(params)
                .then(this.returnOneComment, this.catchError);
        };
        this.findComments = (params) => {
            return this._model.find(params)
                .then(this.returnComments, this.catchError);
        };
        this.saveOneComment = (comment) => {
            return comment.save()
                .then(this.returnOneComment, this.catchError);
        };
        this.removeOneComment = (comment) => {
            return comment.remove()
                .then(this.returnOneComment, this.catchError);
        };
        this.removeComments = (params) => {
            return this._model.deleteMany(params)
                .then(this.returnComments, this.catchError);
        };
        this.returnOneComment = (comment) => {
            if (!comment)
                return Promise.reject(constants_1.constants.errors.no_found_comment);
            return Promise.resolve(comment);
        };
        this.returnComments = (comments) => {
            if (comments.length === 0)
                return Promise.reject(constants_1.constants.errors.no_found_comment);
            return Promise.resolve(comments);
        };
        this.catchError = (error) => Promise.reject(error);
        this._model = Comment_1.default;
    }
}
exports.CommentRepository = CommentRepository;
//# sourceMappingURL=commentRepository.js.map