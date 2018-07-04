var mongoose = require('mongoose');
var url = "mongodb://127.0.0.1:27017/node";

mongoose.connect(url, (error) => {
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

module.exports = PostRepository;