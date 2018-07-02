const PostRepository = require('../repository/postRepository');
const UserController = require('../controllers/userController');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function PostController(){
    this.getAllPosts = (req, res) => {
        let name = req.query.author;
        if(name) return this.getPostsByUsername(res, name);

        name = req.query.favorited;
        if(name) return this.getPostsByFavorited(res, name);

        PostRepository.find({})
            .populate('author')
            .exec((error, posts) => {
            if(error) 
                this.returnError(ERRORS.NO_POSTS);
            else
                res.send(posts.map(post => serialize.getPost(post)));
        });
    },
    this.getPostsByUsername = (res, name) => {
        let {error} = validate.byUsername({name});
        if(error) return this.returnError(error, res);

        UserController.getUserByParams({name})
            .then(user => {
                if(!user) return this.returnError(ERRORS.NO_FOUND_USER, res);
                this.getPostsByParams({author : user.id})
                    .then(posts => {
                        if(error) this.returnError(ERRORS.NO_POSTS);
                        
                        if(posts.legth === 0){
                            res.send('No posts yet');
                        } else {
                            res.send(posts.map(post => serialize.getPost(post)));
                        }
                    })
                // PostRepository.find({author : user.id})
                //     .populate('author')
                //     .exec((error, posts) => {
                //         if(error) this.returnError(ERRORS.NO_POSTS);
                        
                //         if(posts.legth === 0){
                //             res.send('No posts yet');
                //         } else {
                //             res.send(posts.map(post => serialize.getPost(post)));
                //         }
                //     });
            })
            .catch(e => {
                return this.returnError(e.message, res);
            })
    },
    this.getPostsByFavorited = (res, name) => {
        let {error} = validate.byUsername({name});
        if(error) return this.returnError(error, res);

        UserController.getUserByParams({name})
            .then(user => {
                if(!user) return this.returnError(ERRORS.NO_FOUND_USER, res);
                PostRepository.find({author : user.id, favorited: true})
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
        let {error: errorId} = validate.byId(req.params);
        if(errorId) return this.returnError(errorId, res);
        
        let {error} = validate.byPost(req.body);
        if(error) return this.returnError(error, res);

        PostRepository.findByIdAndUpdate(req.params.id, req.body, error => {
            if(error) 
                this.returnError(error, res);
            else
                res.send('Succesfully updated post');
        });
    },
    /**
    * Use by look for user
    * @method  getPostsByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Object} user or error
    */
   this.getPostsByParams = (findParams) => {
        const posts =  PostRepository.find(findParams)
            .populate('author');

        return  posts.exec((error, posts) => {
                if(error) return error;
                else return posts;
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
