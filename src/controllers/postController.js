const PostRepository = require('../repository/postRepository');
const UserRepository = require('../repository/userRepository');
const FollowRepository = require('../repository/followRepository');
const FavoriteRepository = require('../repository/favoriteRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function PostController(){
    this.getAllPosts = (req, res) => {
        const token = req.headers.authorization;

        let name = req.query.author;
        if(name) return this.getAllPostsByParams({name}, res, constants.OPERATION.GET_POSTS_BY_AUTHOR);

        name = req.query.favorited;
        if(name) return this.getAllPostsByParams({name}, res, constants.OPERATION.GET_POSTS_BY_FEVORITED);

        let {error} = validate.byToken(token);
        if(error) {
            PostRepository.getPostsByParams({})
                .then(
                    posts => res.send(posts.map(post => serialize.getPost(post))),
                    error => {throw error}
                )
                .catch(e => validate.returnError(e, res));
        }
        else {
            return this.getAllPostsByParams({token}, res, constants.OPERATION.GET_POSTS_BY_TOKEN);
        }
        
    },
    this.getAllPostsByParams = (params, res, action) => {
        if(action === constants.OPERATION.GET_POSTS_BY_AUTHOR || action === constants.OPERATION.GET_POSTS_BY_FEVORITED){
            let {error} = validate.byUsername(params);
            if(error) validate.returnError(error, res);
        }

        let paramsPosts = {};
        let currentUser = null;

        UserRepository.getOneUserByParams(params)
            .then(
                user => {
                    currentUser = user;
                    if(action === constants.OPERATION.GET_POSTS_BY_AUTHOR){
                        paramsPosts = {author: user.id}
                    }
                },
                error => { throw error }
            )
            .then(() => PostRepository.getPostsByParams(paramsPosts))
            .then(
                posts => {
                    posts = posts.map(post => {
                        if(post.favorites.length > 0){
                            post.favorited = post.favorites.some(user => 
                                user.id === currentUser.id ? true : false);
                        }
                        return post;
                    });
                    if(action === constants.OPERATION.GET_POSTS_BY_FEVORITED){
                        posts = posts.filter(post => {
                            if(post.favorited)
                                return post;
                        })
                    }
                    return posts;
                },
                error => {throw error}
            )
            .then(
                posts => res.send(posts.map(post => serialize.getPost(post)))
            )
            .catch(e => validate.returnError(e, res));
    },
    this.getPostsByFeed = (req, res) => {
        const token = req.headers.authorization;
        let user = null;

        UserRepository.getOneUserByParams({token})
            .then(
                currentUser => {
                    if(currentUser.follows.length === 0)
                        return Promise.reject(constants.ERRORS.NO_FOUND_FOLLOWS);
                    user = currentUser;
                    return user.follows.map(user => user.id);
                },
                error => { throw error }
            )
            .then(
                ids => PostRepository.getPostsByParams({author: {$in: ids}}),
                error => { throw error }
            )
            .then(
                posts => posts.map(post => {
                        if(post.favorites.length > 0)
                            post.favorited = post.favorites.some(currentUser => currentUser.id === user.id ? true : false);
                        return post;
                }),
                error => { throw error }
            )
            .then(
                posts => res.send(posts.map(post => serialize.getPost(post)))
            )
            .catch(e => validate.returnError(e, res));
    },
    this.getPost = (req, res) => {
        const id = req.params.id;
        const {error} = validate.byId({id});
        if(error) return validate.returnError(error, res);

        PostRepository.getOnePostByParams({_id : id})
            .then(
                post => res.send({post: serialize.getPost(post)}),
                error =>  {throw error}
            )            
            .catch(e => validate.returnError(e, res));
    },
    this.addPost = (req, res) => {
        const token = req.headers.authorization;
        const {error} = validate.byPost(req.body);
        if(error) return validate.returnError(error, res);

        UserRepository.getOneUserByParams({token})
            .then(
                user => {
                    let post = new PostRepository({
                        ...req.body,
                        author: user._id
                    });
                    return post.save();
                },
                error => {throw error}
            )
            .then(
                post => {
                    if(post.errors) throw post.errors;
                    res.send({post: serialize.getPost(post)})
                }
            )   
            .catch(e => validate.returnError(e, res))
    },
    this.updatePost = (req, res) => {
        const token = req.headers.authorization;
        let {error: errorId} = validate.byId(req.params);
        if(errorId) return validate.returnError(errorId, res);
        
        let post = serialize.setUpdatePost(req.body);
        let {error} = validate.byUpdatePost(post);
        if(error) return validate.returnError(error, res);

        PostRepository.getOnePostByParams({_id: post.id})
            .then(
                post => {
                    if(token !== post.author.token) 
                        throw constants.ERRORS.NO_POST_OWNER;
                    return post.id;
                },
                error => {throw error}
            )  
            .then(
                id => PostRepository.updateOnePostByParams({_id: id}, post)
            )
            .then(
                () => res.send(serialize.success(constants.MESSAGE.SUCCESFULLY_UPDATED_POST)),
                error =>  {throw error}
            )  
            .catch(e => validate.returnError(e, res))
    },
    this.addFavorite = (req, res) => {
        this.addOrDeleteFavorite(req, res, constants.OPERATION.ADD_FAVORITE);
    },
    this.deleteFavorite = (req, res) => {
        this.addOrDeleteFavorite(req, res, constants.OPERATION.DELETE_FAVORITE);
    }, 
    this.addOrDeleteFavorite = (req, res, action) => {
        const token = req.headers.authorization;
        const id = req.params.id;
        const {error} = validate.byId({id});
        if(error) return validate.returnError(error, res);

        let currentPost = {};

        UserRepository.getOneUserByParams({token})
            .then(
                user => currentUser = user,
                error => {throw error}
            )
            .then(() => PostRepository.getOnePostByParams({_id: id}))
            .then(
                post => {
                    currentPost = post.toObject();
                    Object.assign(currentPost, {id: post.id});

                    if(action === constants.OPERATION.ADD_FAVORITE){
                        post.favouritesCount += 1;
                        post.favorites.push(currentUser.id);
                        currentUser.favorites.push(post.id);
                        currentPost.favouritesCount += 1;
                        currentPost.favorited = true;
                    } 
                    else {
                        post.favouritesCount -= 1;
                        post.favorites.pull(currentUser.id);
                        currentUser.favorites.pull(post.id);
                        currentPost.favouritesCount -= 1;
                        currentPost.favorited = false;
                    }
                    return post.save();
                },
                error => {throw error}
            )
            .then(
                post => {
                    if(post.errors) throw post.errors;
                    return currentUser.save();
                }
            )
            .then(
                user => {
                    if(user.errors) throw user.errors;
                    res.send({post: serialize.getPost(currentPost)});
                }
            )
            .catch(e => validate.returnError(e, res))
    }
}

module.exports = new PostController;