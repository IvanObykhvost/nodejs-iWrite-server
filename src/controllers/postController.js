const PostRepository = require('../repository/postRepository');
const UserRepository = require('../repository/userRepository');
const CommentRepository = require('../repository/commentRepository');
const TagRepository = require('../repository/tagRepository');
const TagController = require('../controllers/tagController');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function PostController(){
    this.getAllPosts = (req, res) => {
        const token = req.headers.authorization;
        let aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };

        let {error} = validate.byToken(token);
        if(error) {
            let count = 0;
            PostRepository.getPostsByParams({})
                .then(
                    posts => {
                        count = posts.length;
                        return PostRepository.getPostsPaginationByParams({}, aggregate);
                    },
                    error => {throw error}
                )
                .then(
                    posts => res.send({
                        posts: posts.map(post => serialize.getPost(post)),
                        count
                    }),
                    error => {throw error}
                )
                .catch(e => validate.sendError(e, res));
        }
        else {
            let name = req.query.author;
            if(name) 
                return this.getAllPostsByParams({name}, token, res, constants.OPERATION.GET_POSTS_BY_AUTHOR, aggregate);

            name = req.query.favorited;
            if(name) 
                return this.getAllPostsByParams({name}, token, res, constants.OPERATION.GET_POSTS_BY_FAVORITED, aggregate);

            let tag = req.query.tag;
            if(tag) 
                return this.getAllPostsByTag(tag, token, res, aggregate);

            return this.getAllPostsByParams({token}, token, res, constants.OPERATION.GET_POSTS_BY_TOKEN, aggregate);
        }
        
    },
    this.getAllPostsByParams = (params, token, res, action, aggregate) => {
        if(action === constants.OPERATION.GET_POSTS_BY_AUTHOR || action === constants.OPERATION.GET_POSTS_BY_FAVORITED){
            let {error} = validate.byUsername(params);
            if(error) validate.sendError(error, res);
        }

        let paramsPosts = {};
        let currentUser = null;

        UserRepository.getOneUserByParams(params)
            .then(
                user => {
                    if(action === constants.OPERATION.GET_POSTS_BY_AUTHOR){
                        paramsPosts = {author: user.id}
                    }
                },
                error => { throw error }
            )
            .then(
                () => UserRepository.getOneUserByParams({token})
            )
            .then(
                user => {
                    currentUser = user;
                    return PostRepository.getPostsByParams(paramsPosts)
                },
                error => { throw error }
            )
            .then(
                posts => {
                    posts = posts.map(post => {
                        if(post.favorites.length > 0){
                            post.favorited = post.favorites.some(user => 
                                user.id === currentUser.id ? true : false);
                        }
                        return post;
                    });
                    if(action === constants.OPERATION.GET_POSTS_BY_AUTHOR){

                    }
                    if(action === constants.OPERATION.GET_POSTS_BY_FAVORITED){
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
                posts => {
                    let count = posts.length;
                    posts = posts.slice(Number(aggregate.offset), Number(aggregate.offset) + Number(aggregate.limit));

                    res.send({
                        posts: posts.map(post => serialize.getPost(post)),
                        count
                    })
                }
            )
            .catch(e => validate.sendError(e, res));
    },
    this.getPostsByFeed = (req, res) => {
        const token = req.headers.authorization;
        let currentUser = null;
        let aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };
        let count = 0;
        let usersId = null;

        UserRepository.getOneUserByParams({token})
            .then(
                user => {
                    if(user.follows.length === 0)
                        return Promise.reject(constants.ERRORS.NO_FOUND_FEED);
                    currentUser = user;
                    return user.follows.map(user => user.id);
                },
                error => { throw error }
            )
            .then(
                ids => {
                    usersId = ids;
                    return PostRepository.getPostsByParams({author: {$in: usersId}})
                },
                error => { throw error }
            )
            .then(
                posts => {
                    count = posts.length;
                    return PostRepository.getPostsPaginationByParams({author: {$in: usersId}}, aggregate);
                },
                error => { throw error }
            )
            .then(
                posts => posts.map(post => {
                    if(post.favorites.length > 0)
                        post.favorited = post.favorites.some(user => user.id === currentUser.id);
                    return post;
                }),
                error => { throw error }
            )
            .then(
                posts => res.send({
                    posts: posts.map(post => serialize.getPost(post)),
                    count
                })
            )
            .catch(e => validate.sendError(e, res));
    },
    this.getAllPostsByTag = (tags, token, res, aggregate) => {
        let count = 0;
        let tagId;
        let currentUser = null;

        UserRepository.getOneUserByParams({token})
            .then(
                user => {
                    currentUser = user;
                    return TagRepository.getOneTagbyParams({text: tags});
                },
                error => { throw error }
            )
            .then(
                tag => {
                    tagId = tag._id;
                    return PostRepository.getPostsByParams({tags: tagId})
                },
                error => { throw error }
            )
            .then(
                posts => {
                    count = posts.length;
                    return PostRepository.getPostsPaginationByParams({tags: tagId}, aggregate);
                },
                error => { throw error }
            )
            .then(
                posts => {
                    posts = posts.map(post => {
                        if(post.favorites.length > 0)
                            post.favorited = post.favorites.some(user => user.id === currentUser.id);
                        return post;
                    });

                    res.send({
                        posts: posts.map(post => serialize.getPost(post)),
                        count
                    })      
                },
                error => { throw error }
            )
            .catch(e => validate.sendError(e, res));
    },
    this.getPost = (req, res) => {
        const id = req.params.id;
        const {error} = validate.byId({id});
        if(error) return validate.sendError(error, res);

        PostRepository.getOnePostByParams({_id : id})
            .then(
                post => res.send({post: serialize.getPost(post)}),
                error =>  {throw error}
            )            
            .catch(e => validate.sendError(e, res));
    },
    this.addPost = (req, res) => {
        const { body, currentUser} = serialize.getCurrentUserFromBody(req.body);
        const {error} = validate.byPost(body);
        if(error) return validate.sendError(error, res);
        
        let currentPost = null;

        let post = new PostRepository({
            ...body,
            tags: [],
            author: currentUser.id
        });
        PostRepository.saveOnePost(post)
            .then(
                post => {
                    currentPost = post;
                    return TagController.saveTagsByPostId(body.tags, post._id)
                },
                error => {throw error}
            ) 
            .then(
                tags => {
                    tags.map(tag => currentPost.tags.push(tag));
                    return PostRepository.saveOnePost(currentPost);
                },
                error => {throw error}
            )   
            .then(
                post => res.send({
                    post: serialize.getPost(post),
                    success: serialize.success(constants.MESSAGE.SUCCESSFULLY_ADDED).success
                }),
                error => {throw error}
            )   
            .catch(e => validate.sendError(e, res))
    },
    this.updatePost = (req, res) => {
        let {error: errorId} = validate.byId(req.params);
        if(errorId) return validate.sendError(errorId, res);
        
        const { body, currentUser} = serialize.getCurrentUserFromBody(req.body);
        let updatePost = serialize.setUpdatePost(body);
        let {error} = validate.byUpdatePost(updatePost);
        if(error) return validate.sendError(error, res);

        PostRepository.getOnePostByParams({_id: updatePost.id})
            .then(
                post => {
                    if(currentUser.token !== post.author.token) 
                        throw constants.ERRORS.NO_POST_OWNER;
                    
                    return TagController.saveTagsByPostId(body.tags, post._id);
                },
                error => {throw error}
            )  
            .then(
                tagsId => {
                    updatePost.tags = [];
                    tagsId.map(tag => updatePost.tags.push(tag));
                    PostRepository.updateOnePostByParams({_id: updatePost.id}, updatePost)
                },
                error =>  {throw error}
            ) 
            .then(
                () => res.send(serialize.success(constants.MESSAGE.SUCCESFULLY_UPDATED_POST)),
                error =>  {throw error}
            )  
            .catch(e => validate.sendError(e, res))
    },
    this.deletePost = (req, res) => {
        const currentUser = req.body.currentUser;
        const postId = req.params.id;
        let {error} = validate.byId(req.params);
        if(error) return validate.sendError(error, res);

        let currentPost = null;

        PostRepository.getOnePostByParams({_id: postId})
            .then(
                post => {
                    if(post.author.id !== currentUser.id)
                        throw constants.ERRORS.NO_POST_OWNER;
                    currentPost = post;
                    return UserRepository.removeFavoriteFromUsers({favorites: postId});
                },
                error =>  {throw error}
            )
            .then(
                () => PostRepository.removeOnePost(currentPost),
                error =>  {throw error}
            )
            .then(
                () => res.send(serialize.success(constants.MESSAGE.SUCCESSFULLY_REMOVED_POST)),
                error =>  {throw error}
            )
            .catch(e => validate.sendError(e, res))
    },

    //Favorite
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
        if(error) return validate.sendError(error, res);

        let currentPost = {};
        let currentUser = null;

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
            .catch(e => validate.sendError(e, res))
    },

    //Comment
    this.getComments = (req, res) => {
        const postId = req.params.id;
        const {error} = validate.byId({id: postId});
        if(error) return validate.sendError(error, res);

        PostRepository.getOnePostByParams({_id: postId})
            .then(
                post => {
                    post.comments = post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    res.send({comments: post.comments.map(comment => serialize.getComment(comment))})
                },
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res))

    },
    this.addComment  = (req, res) => {
        const comment = {
            postId: req.params.id, 
            text: req.body.comment
        };
        const {error} = validate.byComment(comment);
        if(error) return validate.sendError(error, res);

        const body = {
            token: req.headers.authorization,
            ...comment
        }
        this.addOrDeleteComment(body, res, constants.OPERATION.ADD_COMMENT); 
    },
    this.deleteComment  = (req, res) => {
        const comment = {
            postId: req.params.id, 
            commentId: req.params.commentId
        };
        const {error} = validate.byDeleteComment(comment);
        if(error) return validate.sendError(error, res);
        
        const body = {
            token: req.headers.authorization,
            ...comment
        }
        this.addOrDeleteComment(body, res, constants.OPERATION.DELETE_COMMENT); 
    },
    this.addOrDeleteComment = (body, res, action) => {
        let currentUser = null;
        let currentPost = null;
        let currentComment = null;

        UserRepository.getOneUserByParams({token: body.token})
            .then(
                user => currentUser = user,
                error => {throw error}
            )
            .then(
                () => PostRepository.getOnePostByParams({_id: body.postId})
            )
            .then(
                post => {
                    currentPost = post;
                    if(action === constants.OPERATION.ADD_COMMENT){
                        let newComment = new CommentRepository({
                            text: body.text,
                            author: currentUser._id
                        });
                        return newComment;
                    }
                    else {
                        return CommentRepository.getOneCommentByParams({_id: body.commentId});
                    }
                },
                error => {throw error}
            )
            .then(
                comment => action === constants.OPERATION.ADD_COMMENT ? comment.save() : comment.remove(),
                error => {throw error}
            )
            .then(
                comment => {
                    if(comment.errors) throw comment.errors;
                    currentComment = comment;
                    if(action === constants.OPERATION.ADD_COMMENT)
                        currentPost.comments.push(comment.id);
                    else
                        currentPost.comments.pull(comment.id);
                    return currentPost.save();
                }
            )
            .then(
                post => {
                    if(post.errors) throw post.errors;
                    res.send({comment: serialize.getComment(currentComment)});
                }
            )
            .catch(e => validate.sendError(e, res))
    }
}

module.exports = new PostController;