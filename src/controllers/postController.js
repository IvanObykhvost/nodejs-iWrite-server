const PostRepository = require('../repository/postRepository');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;

function PostController(){
    let serialize = new Serialize();
    this.getAllPosts = (req, res) => {
        PostRepository.find({}, (error, posts) => {
            if(error) 
                this.returnError(ERRORS.NO_POSTS);
            else
                res.send(posts.map(post => serialize.getPost(post)));
        });
    },
    this.getPostByUsername = (req, res) => {
        let {error} = validate.byUsername(req.body, res);
        if(error) return this.returnError(error, res);
    },
    this.addPost = (req, res) => {
        let {error} = validate.byPost(req.body, res);
        if(error) return this.returnError(error, res);

        let post = new PostRepository(req.body);
        post.save(error => {
            if(error) 
                this.returnError(error, res);
            else
                res.send(serialize.getPost(post));
        });
    },
    this.updatePost = (req, res) => {
        validate.byId(req.params, res);
        validate.byPost(req.body, res);

        PostRepository.findByIdAndUpdate(req.params.id, req.body, error => {
            if(error) 
                res.status(404).send(error);
            else
                res.send('Succesfully updated post');
        });
    },
    this.returnError = (error, res) => {
        let message = error;
        if(error.details[0]) {
            message = error.details[0].message;
        }
        return res.send(serialize.error(message));
    }
}

function Serialize(){
    this.getPost = (post) => {
        return {
            id: post.id,
            title: post.title,
            topic: post.topic,
            message: post.message,
            tags: post.tags,
        }
    },
    this.error = (error) => {
        return {
            error
        }
    }
}

module.exports = new PostController;
