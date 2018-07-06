const PostRepository = require('../repository/postRepository');
const UserRepository = require('../repository/userRepository');
const FollowRepository = require('../repository/followRepository');
const FavoriteRepository = require('../repository/favoriteRepository.');
const ERRORS = require('../constants').ERRORS;
const MESSAGE = require('../constants').MESSAGE;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function PostController(){
    this.getAllPosts = (req, res) => {
        let name = req.query.author;
        if(name) return this.getPostsByUsername(name, res);

        name = req.query.favorited;
        if(name) return this.getPostsByFavorited(name, res);

        this.getPostsByParams({})
            .then(
                posts => res.send(posts.map(post => serialize.getPost(post))),
                error => {
                    if(error === ERRORS.NO_FOUND_POST)
                        return res.send([]);
                    throw error;
                }
            )
            .catch(e => {
                this.returnError(e, res);
            })
    },
    this.getPostsByUsername = (name, res) => {
        let {error} = validate.byUsername({name});
        if(error) this.returnError(error, res);

        UserRepository.getOneUserByParams({name})
            .then(
                user => this.getPostsByParams({author : user.id}),
                error => this.returnError(error, res)
            )
            .then(
                posts => res.send(posts.map(post => serialize.getPost(post))),
                error => {
                    if(error === ERRORS.NO_FOUND_POST)
                        return res.send([]);
                    throw error; 
                }
            )
            .catch(e => {
                this.returnError(e, res);
            })
    },
    this.getPostsByFavorited = (name, res) => {
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
            .then(
                user => FollowRepository.find({user: user.id}),
                error =>  this.returnError(error, res)
            )
            .then(users => {
                if(users.errors) throw users.error;

                if(users.length === 0) return Promise.reject();

                let ids = [];
                users.forEach(element => {
                    ids.push(element.followUser.id);
                });
                return ids;
            })
            .then(ids => 
                this.getPostsByParams({author: {$in: ids}}),
                () => res.send([])
            )
            .then(posts =>{
                    if(posts.errors) throw posts.error;

                    if(posts.length === 0) 
                        return Promise.reject();
                    else {
                        res.send(posts.map(post => serialize.getPost(post)));
                    }
                }
            )
            .then(
                null,
                () => res.send([])
            )
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
        const token = req.headers.authorization;
        const id = req.params.id;
        let {error} = validate.byId({id});
        if(error) return this.returnError(error, res);
        
        let currentUser = null;
        let currentPost = null;

        //find user
        UserController.getOneUserByParams({token})
            .then(
                user => currentUser = user,
                error => this.returnError(error, res)
            )
        //find post
            .then(() => this.getOnePostByParams({_id: id}))
        //+1 Count
            .then(
                post => {
                    post.favouritesCount += 1;
                    currentPost = post;
                    return post.save();
                },
                error => this.returnError(error, res)
            )
        //add favorite
            .then(post => {
                if(post.errors) throw error;
                let favorite = new FavoriteRepository({
                    user: currentUser.id,
                    post: currentPost.id
                });
                return favorite.save()
            })
        //return post
            .then(favorite => {
                if(favorite.errors) throw error;
                currentPost.favorited = true;
                res.send({post: serialize.getPost(currentPost)});
            })
            .catch( error => {
                this.returnError(error, res);
            })
    },
    /**
    * Use by looking for Posts
    * @method  getPostsByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @return {Array[Objects]} posts or error
    */
   this.getPostsByParams = (findParams) => {
        return PostRepository.find(findParams, null, {sort: '-updatedAt'})
            .then(posts => {
                if(posts.length === 0) return Promise.reject(ERRORS.NO_FOUND_POST);
                if(posts.errors) return Promise.reject(error);

                return posts;
            });
    },
     /**
    * Use by looking for Post
    * @method  getPostsByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Object} post or error
    */
    this.getOnePostByParams = (findParams) => {
        return PostRepository.findOne(findParams)
            .then(post => {
                if(!post) return Promise.reject(ERRORS.NO_FOUND_POST)
                if(post.errors) return Promise.reject(error);
                return post;
            });
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