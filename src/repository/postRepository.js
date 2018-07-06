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
    favouritesCount: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    tags: {type: String, required: false},
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    comments: [{
        text: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }]
});

PostSchema.pre('find', function() {
    this.populate('author');
});

PostSchema.pre('findOne', function() {
    this.populate('author');
});

const PostRepository = mongoose.model('posts', PostSchema);

/**
* Use by looking for Posts
* @method  getPostsByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @return {Array[Objects]} posts or error
*/
PostRepository.getPostsByParams = (findParams) => {
    return PostRepository.find(findParams, null, {sort: '-updatedAt'})
        .then(posts => {
            if(posts.length === 0) return Promise.reject(ERRORS.NO_FOUND_POST);
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
            if(!post) return Promise.reject(ERRORS.NO_FOUND_POST)
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

module.exports = PostRepository;