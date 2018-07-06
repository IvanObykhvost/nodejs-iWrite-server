const PostRepository = require('../repository/postRepository');
const UserRepository = require('../repository/userRepository');
const FollowRepository = require('../repository/followRepository');
const FavoriteRepository = require('../repository/favoriteRepository');
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

        PostRepository.getPostsByParams({})
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
                user => PostRepository.getPostsByParams({author : user.id}),
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

        UserRepository.getOneUserByParams({name})
            .then(
                user => FavoriteRepository.getFavoritesByParams({user : user.id}),
                error => this.returnError(error, res)
            )
            .then(favorites => {
                    let ids = [];
                    favorites.forEach(element => {
                        ids.push(element.post.id);
                    });
                    return PostRepository.getPostsByParams({_id : {$in: ids}})
                },
                error => {
                    if(error === ERRORS.NO_FOUND_POST)
                        return res.send([]);
                    this.returnError(error, res)
                }
            )
            .then(
                posts => res.send(posts.map(post => serialize.getPost(post))),
                error => {
                    if(error === ERRORS.NO_FOUND_POST)
                        //return res.send(MESSAGE.NO_POSTS_YET);
                        return res.send([]);
                    this.returnError(error, res)
                }
            )
            .catch(e => {
                this.returnError(e, res);
            })
    },
    this.getPostsByFeed = (req, res) => {
        const token = req.headers.authorization;
        let userId = null;
        let posts = [];

        UserRepository.getOneUserByParams({token})
            .then(
                user => {
                    userId = user.id;
                    return FollowRepository.getFollowsByParams({user: userId})
                },
                error =>  this.returnError(error, res)
            )
            .then(follows => {
                    let ids = [];
                    follows.forEach(element => {
                        ids.push(element.followUser.id);
                    });
                    return ids;
                }, 
                error =>  {
                    if(error === ERRORS.NO_FOUND_POST)
                        return res.send([]);
                    this.returnError(error, res)
                }
            )
            .then(ids => PostRepository.getPostsByParams({author: {$in: ids}}))
            .then(
                posts => {
                    posts = posts;
                    let ids = [];
                    posts.forEach(element => {
                        ids.push(element.id);
                    });
                    return FavoriteRepository.getFavoritesByParams({user: userId, post: {$in: ids}})
                },
                error =>  {
                    if(error === ERRORS.NO_FOUND_POST)
                        return res.send([]);
                    this.returnError(error, res)
                }
            )
            .then(favorites => {
                    // let po = posts.map(post => {
                    //     post.favorite = 
                    // });
                    res.send(posts.map(post => {
                           serialize.getPost(post)}
                    ))
                },
                error =>  this.returnError(error, res)
            )
            // .then(
            //     posts => {
            //         res.send(posts.map(post => {
            //             serialize.getPost(post)
            //         }))
            //     },
            //     error =>  {
            //         if(error === ERRORS.NO_FOUND_POST)
            //             return res.send([]);
            //         this.returnError(error, res)
            //     }
            // )
            .catch(e => {
                this.returnError(e, res);
            })
    },
    this.getPost = (req, res) => {
        const id = req.params.id;
        let {error} = validate.byId({id});
        if(error) return this.returnError(error, res);

        PostRepository.getOnePostByParams({_id : id})
            .then(
                post => res.send({post: serialize.getPost(post)}),
                error =>  this.returnError(error, res)
            )            
            .catch(error =>
                this.returnError(error, res)
            );
    },
    this.addPost = (req, res) => {
        const token = req.headers.authorization;
        let {error} = validate.byPost(req.body);
        if(error) return this.returnError(error, res);

        UserRepository.getOneUserByParams({token})
            .then(
                user => {
                    let post = new PostRepository({
                        ...req.body,
                        author: user._id
                    });
                    return post.save();
                },
                error =>  this.returnError(error, res)
            )
            .then(post => {
                    if(post.errors) throw post.errors;
                    res.send({post: serialize.getPost(post)})
                }
            )   
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

        post.updatedAt = new Date();

        PostRepository.getOnePostByParams({_id: post.id})
            .then(
                post => {
                    if(token !== post.author.token) 
                        throw ERRORS.NO_POST_OWNER;
                    return post.id;
                },
                error =>  this.returnError(error, res)
            )  
            .then(
                id => PostRepository.updateOnePostByParams({_id: id}, post)
            )
            .then(
                () => res.send(serialize.success(MESSAGE.SUCCESFULLY_UPDATED_POST)),
                error =>  this.returnError(error, res)
            )  
            .catch( error => {
                this.returnError(error, res);
            })
    },
    this.addFavorite = (req, res) => {
        const token = req.headers.authorization;
        const id = req.params.id;
        let {error} = validate.byId({id});
        if(error) return this.returnError(error, res);
        
        let currentUser = null;
        let currentPost = null;

        //find user
        UserRepository.getOneUserByParams({token})
            .then(
                user => currentUser = user,
                error => this.returnError(error, res)
            )
        //find post
            .then(() => PostRepository.getOnePostByParams({_id: id}))
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
                if(post.errors) throw post.errors;
                let favorite = new FavoriteRepository({
                    user: currentUser.id,
                    post: currentPost.id
                });
                return favorite.save()
            })
        //return post
            .then(favorite => {
                if(favorite.errors) throw favorite.errors;
                currentPost.favorited = true;
                res.send({post: serialize.getPost(currentPost)});
            })
            .catch( error => {
                this.returnError(error, res);
            })
    },
    this.deleteFavorite = (req, res) => {
        const token = req.headers.authorization;
        const id = req.params.id;
        let {error} = validate.byId({id});
        if(error) return this.returnError(error, res);
        
        let currentUser = null;
        let currentPost = null;

        //find user
        UserRepository.getOneUserByParams({token})
            .then(
                user => currentUser = user,
                error => this.returnError(error, res)
            )
        //find post
            .then(() => PostRepository.getOnePostByParams({_id: id}))
        //+1 Count
            .then(
                post => {
                    post.favouritesCount -= 1;
                    currentPost = post;
                    return post.save();
                },
                error => this.returnError(error, res)
            )
        //delete favorite
            .then(post => {
                if(post.errors) throw post.errors;
                return FavoriteRepository.deleteFavoriteByParams({user: currentUser.id, post: post.id})
            })
        //return post
            .then(favorite => {
                if(favorite.errors) throw favorite.errors;
                currentPost.favorited = false;
                res.send({post: serialize.getPost(currentPost)});
            })
            .catch( error => {
                this.returnError(error, res);
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