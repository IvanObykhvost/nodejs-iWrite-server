const PostRepository = require('../repository/postRepository');
const UserRepository = require('../repository/userRepository');
const CommentRepository = require('../repository/commentRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function CommentController(){
    this.getComments = (req, res) => {
        const postId = req.params.id;
        const {error} = validate.byId({id: postId});
        if(error) return validate.sendError(error, res);

        let aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };

        PostRepository.getOnePostByParams({_id: postId})
            .then(
                post => {
                    post.comments = post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    let count = post.comments.length;
                    post.comments = post.comments.slice(Number(aggregate.offset), Number(aggregate.offset) + Number(aggregate.limit));
                    res.send({
                        comments: post.comments.map(comment => serialize.getComment(comment)),
                        count
                    })
                },
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res))

    },
    this.addComment  = (req, res) => {
        const comment = {
            postId: req.params.id, 
            text: req.body.comment
        };
        const {error} = validate.byComment(comment);
        if(error) return validate.sendError(error, res);

        const body = {
            token: req.headers.authorization,
            ...comment
        }
        this.addOrDeleteComment(body, res, constants.OPERATION.ADD_COMMENT); 
    },
    this.deleteComment  = (req, res) => {
        const comment = {
            postId: req.params.id, 
            commentId: req.params.commentId
        };
        const {error} = validate.byDeleteComment(comment);
        if(error) return validate.sendError(error, res);
        
        const body = {
            token: req.headers.authorization,
            ...comment
        }
        this.addOrDeleteComment(body, res, constants.OPERATION.DELETE_COMMENT); 
    },
    this.addOrDeleteComment = (body, res, action) => {
        let currentUser = null;
        let currentPost = null;
        let currentComment = null;

        UserRepository.getOneUserByParams({token: body.token})
            .then(
                user => currentUser = user,
                error => {throw error}
            )
            .then(
                () => PostRepository.getOnePostByParams({_id: body.postId})
            )
            .then(
                post => {
                    currentPost = post;
                    if(action === constants.OPERATION.ADD_COMMENT){
                        let newComment = new CommentRepository({
                            text: body.text,
                            author: currentUser._id
                        });
                        return newComment;
                    }
                    else {
                        return CommentRepository.getOneCommentByParams({_id: body.commentId});
                    }
                },
                error => {throw error}
            )
            .then(
                comment => action === constants.OPERATION.ADD_COMMENT ? comment.save() : comment.remove(),
                error => {throw error}
            )
            .then(
                comment => {
                    if(comment.errors) throw comment.errors;
                    currentComment = comment;
                    if(action === constants.OPERATION.ADD_COMMENT)
                        currentPost.comments.push(comment.id);
                    else
                        currentPost.comments.pull(comment.id);
                    return currentPost.save();
                }
            )
            .then(
                post => {
                    if(post.errors) throw post.errors;
                    res.send({comment: serialize.getComment(currentComment)});
                }
            )
            .catch(e => validate.sendError(e, res))
    }
}

module.exports = new CommentController;