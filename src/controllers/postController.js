const PostRepository = require('../repository/postRepository');
const UserController = require('../controllers/userController');
const FollowRepository = require('../repository/followRepository');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function PostController(){
    this.getAllPosts = (req, res) => {
        let name = req.query.author;
        if(name) return this.getPostsByUsername(res, name);

        name = req.query.favorited;
        if(name) return this.getPostsByFavorited(res, name);

        this.getPostsByParams({})
            .then(posts => {
                if(posts.details) this.returnError(ERRORS.NO_POSTS);
                
                if(posts.length === 0){
                    res.send([]);
                } else {
                    res.send(posts.map(post => serialize.getPost(post)));
                }
            })
    },
    this.getPostsByUsername = (res, name) => {
        let {error: errorName} = validate.byUsername({name});
        if(errorName) this.returnError(errorName, res);

        UserController.getOneUserByParams({name})
            .then(user => {
                if(!user) this.returnError(ERRORS.NO_FOUND_USER, res);

                this.getPostsByParams({author : user.id})
                    .then(posts => {
                        if(posts.details) this.returnError(ERRORS.NO_POSTS);
                        
                        if(posts.length === 0){
                            res.send([]);
                        } else {
                            res.send(posts.map(post => serialize.getPost(post)));
                        }
                    })
            })
            .catch(e => {
                this.returnError(e, res);
            })
    },
    this.getPostsByFavorited = (res, name) => {
        let {error} = validate.byUsername({name});
        if(error) return this.returnError(error, res);

        UserController.getOneUserByParams({name})
            .then(user => {
                if(!user) return this.returnError(ERRORS.NO_FOUND_USER, res);

                this.getPostsByParams({author : user.id, favorited: true})
                    .then(posts => {
                        if(posts.details) this.returnError(ERRORS.NO_POSTS);
                        
                        if(posts.length === 0){
                            res.send('No posts yet');
                        } else {
                            res.send(posts.map(post => serialize.getPost(post)));
                        }
                    })
            })
            .catch(e => {
                this.returnError(e, res);
            })
    },
    this.getPostsByFeed = (req, res) => {
        const token = req.headers.authorization;

        UserController.getOneUserByParams({token})
            .then(user => {
                if(user.errors) throw user.errors;
                if(!user) throw ERRORS.NO_FOUND_USER;

                return FollowRepository.find({user: user.id})
            })
            .then(users => {
                if(users.errors) throw users.error;

                if(users.length === 0) 
                    res.send([]);
                else {
                    let ids = [];
                    users.forEach(element => {
                        ids.push(element.followUser.id);
                    });
                    return ids;
                }
            })
            .then(ids => 
                this.getPostsByParams({author: {$in: ids}})
            )
            .then(posts =>{
                if(posts.errors) throw posts.error;

                if(posts.length === 0) 
                    res.send([]);
                else {
                    res.send(posts.map(post => serialize.getPost(post)));
                }
            })
            .catch(e => {
                this.returnError(e, res);
            })
    },
    this.getPost = (req, res) => {
        const id = req.params.id;
        let {error} = validate.byId({id});
        if(error) return this.returnError(error, res);

        this.getOnePostByParams({_id : id})
            .then(post => {
                    if(!post) 
                        throw ERRORS.NO_POSTS;
                    else
                        res.send({post: serialize.getPost(post)})
            })
            .catch(error =>
                this.returnError(error, res)
            );
    },
    this.addPost = (req, res) => {
        const token = req.headers.authorization;
        let {error: errorPost} = validate.byPost(req.body);
        if(errorPost) return this.returnError(errorPost, res);

        UserController.getOneUserByParams({token})
            .then(user => {
                if(!user) throw ERRORS.NO_FOUND_USER;
                let post = new PostRepository({
                    ...req.body,
                    author: user._id
                });
                post.save(error => {
                    if(error) 
                        throw error;
                    else
                        res.send(serialize.getPost(post));
                });
            })
            .catch(error => 
                this.returnError(error, res)
            )
    },
    this.updatePost = (req, res) => {
        const token = req.headers.authorization;
        let {error: errorId} = validate.byId(req.params);
        if(errorId) return this.returnError(errorId, res);
        
        let post = serialize.setUpdatePost(req.body);
        let {error} = validate.byUpdatePost(post);
        if(error) return this.returnError(error, res);

        // post.updatedAt = new Date();

        this.getOnePostByParams({_id: post.id})
            .then(post => {
                    if(!post) throw ERRORS.NO_FOUND_USER;
                    
                    if(token !== post.author.token) throw 'post not owner this user';

                    return post.id;
                }
            )
            .then(id => {
                    PostRepository.findByIdAndUpdate(id, post, error => {
                        if(error) 
                            throw error.message;
                        else
                            res.send('Succesfully updated post');
                    });
            })
            .catch( error => {
                this.returnError(error, res);
            })
    },
    this.postFavorite = (req, res) => {

    },
    /**
    * Use by look for Posts
    * @method  getPostsByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Array[Objects]} posts or error
    */
   this.getPostsByParams = (findParams) => {
        return PostRepository.find(findParams, 
            null,
            {sort: '-updatedAt'},
            (error, posts) => {
                if(error) return error;
                else return posts;
        })
    },
     /**
    * Use by look for Post
    * @method  getPostsByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Object} post or error
    */
    this.getOnePostByParams = (findParams) => {
        return PostRepository.findOne(findParams, 
            (error, post) => {
                if(error) return error;
                else return post;
        })
    },
    this.returnError = (error, res) => {
        let message = error;
        if(error.details) {
            message = error.details[0].message;
        }
        if(error.message){
            message = error.message;
        }
        return res.send(serialize.error(message));
    }
}

module.exports = new PostController;
