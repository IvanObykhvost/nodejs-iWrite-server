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
    tags: {type: String, required: false}
});

const PostRepository = mongoose.model('posts', PostSchema);

module.exports = PostRepository;