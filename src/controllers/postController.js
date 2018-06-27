const PostRepository = require('../repository/postRepository');
const UserController = require('../controllers/userController');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function PostController(){
    this.getAllPosts = (req, res) => {
        PostRepository.find({}, (error, posts) => {
            if(error) 
                this.returnError(ERRORS.NO_POSTS);
            else
                res.send(posts.map(post => serialize.getPost(post)));
        });
    },
    this.getPostsByUsername = (req, res) => {
        let {error} = validate.byUsername(req.params);
        if(error) return this.returnError(error, res);

        const name = req.params.name;
        UserController.getUserByParams({name})
            .then(user => {
                if(!user) return this.returnError(ERRORS.NO_FOUND_USER, res);
                PostRepository.find({author : user.id})
                    .populate('author')
                    .exec((error, posts) => {
                        if(error) this.returnError(ERRORS.NO_POSTS);
                        
                        if(posts.legth === 0){
                            res.send('No posts yet');
                        } else {
                            res.send(posts.map(post => serialize.getPost(post)));
                        }
                    });
            })
            .catch(e => {
                return this.returnError(e.message, res);
            })
    },
    this.addPost = (req, res) => {
        const token = req.headers.authorization;
        let {error} = validate.byPost(req.body);
        if(error) return this.returnError(error, res);

        UserController.getUserByParams({token})
            .then(user => {
                if(!user) return this.returnError(ERRORS.NO_FOUND_USER, res);
                let post = new PostRepository({
                    ...req.body,
                    author: user._id
                });
                post.save(error => {
                    if(error) 
                        this.returnError(error, res);
                    else
                        res.send(serialize.getPost(post));
                });
            })
            .catch(e => {
                return this.returnError(e.message, res);
            })
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
        if(error.details) {
            message = error.details[0].message;
        }
        return res.send(serialize.error(message));
    }
}

module.exports = new PostController;
