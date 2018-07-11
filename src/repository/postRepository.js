const constants = require('../constants');

const mongoose = require('mongoose');
const url = "mongodb://127.0.0.1:27017/node";
const option = { 
    useNewUrlParser: true 
}

mongoose.connect(url, option, (error) => {
    if(error) console.log(error);
    else console.log("PostRepository connected");
});

const PostSchema = new mongoose.Schema({
    title: {type: String, required: true},
    topic: {type: String, required: true},
    message: {type: String, required: true},
    favorited: {type: Boolean, default: false},
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    favouritesCount: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    tags: {type: String, required: false},
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    }]
});

PostSchema.pre('find', function() {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
});

PostSchema.pre('findOne', function() {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
});

PostSchema.pre('findOneAndUpdate', function(next) {
    this.update({}, {updatedAt: new Date()});
    next();
});

PostSchema.pre('save', function(next) {
    this.populate('author').execPopulate();
    next();
});

PostSchema.pre('remove', function(next) {
    next();
});

const PostRepository = mongoose.model('posts', PostSchema);

/**
* Use by looking for Posts
* @method  getPostsByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @return {Array[Objects]} posts or error
*/
PostRepository.getPostsByParams = (findParams) => {
    return PostRepository.find(findParams, null, {sort: '-createdAt'})
        .then(posts => {
            if(posts.length === 0) return Promise.reject(constants.ERRORS.NO_FOUND_POSTS);
            if(posts.errors) return Promise.reject(posts.errors);
            return posts;
        });
}

 /**
* Use by looking for Post
* @method  getOnePostByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @returns {Object} post or error
*/
PostRepository.getOnePostByParams = (findParams) => {
    return PostRepository.findOne(findParams)
        .then(post => {
            if(!post) return Promise.reject(constants.ERRORS.NO_FOUND_POST)
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

PostRepository.updateOnePostByParams = (findParams, post) => {
    return PostRepository.findOneAndUpdate(findParams, post, {new: true})
        .then(post => {
            if(!post) return Promise.reject(constants.ERRORS.NO_FOUND_POST);
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

PostRepository.saveOnePost = (post) => {
    return post.save()
        .then(post => {
            if(!post) return Promise.reject(constants.ERRORS.NO_FOUND_POST);
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

PostRepository.removeOnePost = (post) => {
    return post.remove()
        .then(post => {
            if(!post) return Promise.reject(constants.ERRORS.NO_FOUND_POST);
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

module.exports = PostRepository;