"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../utils/validate");
const serialize_1 = require("../utils/serialize");
const postRepository_1 = require("../repository/postRepository");
const commentRepository_1 = require("../repository/commentRepository");
const constants_1 = require("../constants");
class CommentController {
    constructor() {
        this.getComments = (req, res) => {
            const postId = req.params.id;
            const { error } = this._validate.byId({ id: postId });
            if (error)
                return this._validate.sendError(error, res);
            const aggregate = {
                limit: +req.query.limit,
                offset: +req.query.offset
            };
            this._postRepository.findOnePost({ _id: postId })
                .then(post => {
                post.comments = post.comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                const count = post.comments.length;
                post.comments = post.comments.slice(aggregate.offset, aggregate.offset + aggregate.limit);
                res.send({
                    comments: post.comments.map(comment => this._serialize.getComment(comment)),
                    count
                });
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this.addComment = (req, res) => {
            const comment = {
                postId: req.params.id,
                text: req.body.comment
            };
            const { currentUser } = this._serialize.getCurrentUserFromBody(req.body);
            const { error } = this._validate.byComment(comment);
            if (error)
                return this._validate.sendError(error, res);
            this.addOrDeleteComment(comment, currentUser, res, constants_1.constants.operation.add_comment);
        };
        this.deleteComment = (req, res) => {
            const comment = {
                postId: req.params.id,
                commentId: req.params.commentId
            };
            const { currentUser } = this._serialize.getCurrentUserFromBody(req.body);
            const { error } = this._validate.byDeleteComment(comment);
            if (error)
                return this._validate.sendError(error, res);
            this.addOrDeleteComment(comment, currentUser, res, constants_1.constants.operation.delete_comment);
        };
        this.addOrDeleteComment = (body, currentUser, res, action) => {
            let currentPost;
            let currentComment;
            this._postRepository.findOnePost({ _id: body.postId })
                .then(post => {
                currentPost = post;
                if (action === constants_1.constants.operation.add_comment) {
                    const comment = this._commentRepository.createNewModel({
                        text: body.text,
                        author: currentUser._id
                    });
                    return comment;
                }
                else {
                    return this._commentRepository.findOneComment({ _id: body.commentId });
                }
            })
                .then(commmet => {
                if (action === constants_1.constants.operation.add_comment)
                    return this._commentRepository.saveOneComment(commmet);
                return this._commentRepository.removeOneComment(commmet);
            })
                .then(comment => {
                currentComment = comment;
                if (action === constants_1.constants.operation.add_comment)
                    currentPost.comments.push(comment._id);
                else
                    currentPost.comments = currentPost.comments.filter(el => el.id != comment.id);
                return this._postRepository.saveOnePost(currentPost);
            })
                .then(() => res.send({ comment: this._serialize.getComment(currentComment) }))
                .catch(e => this._validate.sendError(e, res));
        };
        this._validate = new validate_1.Validate();
        this._serialize = new serialize_1.Serialize();
        this._postRepository = new postRepository_1.PostRepository();
        this._commentRepository = new commentRepository_1.CommentRepository();
    }
}
exports.CommentController = CommentController;
//# sourceMappingURL=commentController.js.map