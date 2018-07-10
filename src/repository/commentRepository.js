const constants = require('../constants');

const mongoose = require('mongoose');
const url = "mongodb://127.0.0.1:27017/node";
const option = { 
    useNewUrlParser: true 
}

mongoose.connect(url, option, (error) => {
    if(error) console.log(error);
    else console.log("CommentRepository connected");
});

const CommentSchema = new mongoose.Schema({
    text: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});

CommentSchema.pre('find', function() {
    this.populate('author');
});

CommentSchema.pre('findOne', function() {
    this.populate('author');
});

CommentSchema.pre('save', function(next) {
    this.populate('author').execPopulate();
    next();
});

CommentSchema.pre('remove', function(next) {
    this.populate('author').execPopulate();
    next();
});

const CommentRepository = mongoose.model('comments', CommentSchema);

/**
* Use by looking for Posts
* @method  getCommentsByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @return {Array[Objects]} posts or error
*/
CommentRepository.getCommentsByParams = (findParams) => {
    return CommentRepository.find(findParams, null, {sort: '-createdAt'})
        .then(comments => {
            if(comments.length === 0) return Promise.reject(constants.ERRORS.NO_FOUND_COMMENTS);
            if(comments.errors) return Promise.reject(comments.errors);
            return comments;
        });
}

 /**
* Use by looking for Post
* @method  getOneCommentByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @returns {Object} post or error
*/
CommentRepository.getOneCommentByParams = (findParams) => {
    return CommentRepository.findOne(findParams)
        .then(comment => {
            if(!comment) return Promise.reject(constants.ERRORS.NO_FOUND_COMMENT)
            if(comment.errors) return Promise.reject(comment.errors);
            return comment;
        });
}


module.exports = CommentRepository;