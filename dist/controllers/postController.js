"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postRepository_1 = require("../repository/postRepository");
const tagController_1 = require("../controllers/tagController");
const serialize_1 = require("../utils/serialize");
const validate_1 = require("../utils/validate");
const constants_1 = require("../constants");
const userController_1 = require("./userController");
const userRepository_1 = require("../repository/userRepository");
const tagRepository_1 = require("../repository/tagRepository");
const commentRepository_1 = require("../repository/commentRepository");
class PostController {
    constructor() {
        this.getAllPosts = (req, res) => {
            const token = req.headers.authorization;
            const aggregate = {
                limit: +req.query.limit,
                offset: +req.query.offset
            };
            const { error } = this._validate.byToken(token);
            if (error) {
                let count = 0;
                this._postRepository.findPosts({})
                    .then(posts => {
                    count = posts.length;
                    return this._postRepository.findPostsWithPagination({}, aggregate);
                })
                    .then(posts => res.send({
                    posts: posts.map(post => this._serialize.getPost(post)),
                    count
                }))
                    .catch(e => this._validate.sendError(e, res));
            }
            else {
                let name = req.query.author;
                if (name)
                    return this.getAllPostsWithToken({ name }, token, res, constants_1.constants.operation.get_posts_by_author, aggregate);
                name = req.query.favorited;
                if (name)
                    return this.getAllPostsWithToken({ name }, token, res, constants_1.constants.operation.get_posts_by_favorited, aggregate);
                let tag = req.query.tag;
                if (tag)
                    return this.getPostsByTag(tag, token, res, aggregate);
                return this.getAllPostsWithToken({ token }, token, res, constants_1.constants.operation.get_posts_by_token, aggregate);
            }
        };
        this.getAllPostsWithToken = (params, token, res, action, aggregate) => {
            if (action === constants_1.constants.operation.get_posts_by_author || action === constants_1.constants.operation.get_posts_by_favorited) {
                const { error } = this._validate.byUsername(params);
                if (error)
                    this._validate.sendError(error, res);
            }
            let paramsPosts = {};
            let currentUser;
            let author;
            this._userRepository.findOneUser(params)
                .then(user => {
                author = user;
                if (action === constants_1.constants.operation.get_posts_by_author)
                    paramsPosts = { author: user._id };
                return this._userRepository.findOneUser({ token });
            })
                .then(() => this._userRepository.findOneUser({ token }))
                .then(user => {
                currentUser = user;
                return this._postRepository.findPosts(paramsPosts);
            })
                .then(posts => {
                posts = posts.map(post => {
                    if (post.favorites.length > 0) {
                        post.favorited = post.favorites.some(user => user.id === author.id);
                    }
                    return post;
                });
                if (action === constants_1.constants.operation.get_posts_by_favorited) {
                    posts = posts.filter(post => {
                        if (post.favorited)
                            return post;
                    });
                }
                return posts;
            })
                .then(posts => {
                const count = posts.length;
                posts = posts.slice(aggregate.offset, aggregate.offset + aggregate.limit);
                res.send(this._serialize.sendPosts(posts, count));
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this.getPostsByFeed = (req, res) => {
            const { currentUser } = this._serialize.getCurrentUserFromBody(req.body);
            const aggregate = {
                limit: +req.query.limit,
                offset: +req.query.offset
            };
            let count = 0;
            let usersId = [];
            if (currentUser.followings.length === 0)
                return this._validate.sendError(constants_1.constants.errors.no_found_feed, res);
            usersId = currentUser.followings.map(user => user.id);
            this._postRepository.findPosts({ author: { $in: usersId } })
                .then(posts => {
                count = posts.length;
                return this._postRepository.findPostsWithPagination({ author: { $in: usersId } }, aggregate);
            })
                .then(posts => posts.map(post => {
                if (post.favorites.length > 0)
                    post.favorited = post.favorites.some(user => user.id === currentUser.id);
                return post;
            }))
                .then(posts => res.send(this._serialize.sendPosts(posts, count)))
                .catch(e => this._validate.sendError(e, res));
        };
        this.getPostsByTag = (tag, token, res, aggregate) => {
            let count = 0;
            let currentTag;
            let currentUser;
            this._userRepository.findOneUser({ token })
                .then(user => {
                currentUser = user;
                return this._tagRepository.findOneTag({ text: tag });
            })
                .then(tagModel => {
                currentTag = tagModel;
                return this._postRepository.findPosts({ tags: currentTag._id });
            })
                .then(posts => {
                count = posts.length;
                return this._postRepository.findPostsWithPagination({ tags: currentTag._id }, aggregate);
            })
                .then(posts => {
                posts = posts.map(post => {
                    if (post.favorites.length > 0)
                        post.favorited = post.favorites.some(user => user.id === currentUser.id);
                    return post;
                });
                res.send(this._serialize.sendPosts(posts, count));
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this.getOnePost = (req, res) => {
            const id = req.params.id;
            const { error } = this._validate.byId({ id });
            if (error)
                return this._validate.sendError(error, res);
            this._postRepository.findOnePost({ _id: id })
                .then(post => res.send({ post: this._serialize.getPost(post) }))
                .catch(e => this._validate.sendError(e, res));
        };
        this.addNewPost = (req, res) => {
            const { body, currentUser } = this._serialize.getCurrentUserFromBody(req.body);
            const { error } = this._validate.byPost(body);
            if (error)
                return this._validate.sendError(error, res);
            let currentPost;
            let newPost = this._postRepository.createNewPost(Object.assign({}, body, { tags: [], author: currentUser.id }));
            // currentUser.postCount++;
            // this._userRepository.saveOneUser(currentUser)
            this._postRepository.saveOnePost(newPost)
                .then(post => {
                currentPost = post;
                return this._tagController.saveTagsByPostId(body.tags, post);
            })
                .then(tags => {
                tags.map(tag => currentPost.tags.push(tag));
                return this._postRepository.saveOnePost(currentPost);
            })
                .then(post => res.send({
                post: this._serialize.getPost(post),
                success: constants_1.constants.message.successfully_added
            }))
                .catch(e => this._validate.sendError(e, res));
        };
        this.updatePost = (req, res) => {
            const { error: errorId } = this._validate.byId(req.params);
            if (errorId)
                return this._validate.sendError(errorId, res);
            const { body, currentUser } = this._serialize.getCurrentUserFromBody(req.body);
            let updatePost = this._serialize.setUpdatePost(body);
            const { error } = this._validate.byUpdatePost(updatePost);
            if (error)
                return this._validate.sendError(error, res);
            this._postRepository.findOnePost({ _id: updatePost.id })
                .then(post => {
                if (post.author.token !== currentUser.token)
                    throw constants_1.constants.errors.no_post_owner;
                return this._tagController.saveTagsByPostId(body.tags, post);
            })
                .then(tagsId => {
                updatePost.tags = [];
                tagsId.map(tag => updatePost.tags.push(tag));
                return this._postRepository.updateOnePost({ _id: updatePost.id }, updatePost);
            })
                .then(() => res.send(this._serialize.success(constants_1.constants.message.succesfully_updated_post)))
                .catch(e => this._validate.sendError(e, res));
        };
        this.deletePost = (req, res) => {
            const currentUser = req.body.currentUser;
            const postId = req.params.id;
            const { error } = this._validate.byId(req.params);
            if (error)
                return this._validate.sendError(error, res);
            let currentPost;
            // currentUser.postCount--;
            // this._userRepository.saveOneUser(currentUser)
            this._postRepository.findOnePost({ _id: postId })
                .then(post => {
                if (post.author.id !== currentUser.id)
                    throw constants_1.constants.errors.no_post_owner;
                currentPost = post;
                return this._userController.removeFavoriteFromUsers({ favorites: post._id });
            })
                .then(() => {
                return this.removeOnePost(currentPost);
            })
                .then(() => {
                res.send(this._serialize.success(constants_1.constants.message.successfully_removed_post));
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this.removeOnePost = (currentPost) => {
            const commentsId = currentPost.comments.map(comment => comment.id);
            let tagsId = currentPost.tags.map(tag => tag.id);
            return this._commentRepository.removeComments({ _id: { $in: commentsId } })
                .then(() => {
                if (tagsId.length !== 0)
                    return this._tagController.deleteRefPostInTag({ _id: { $in: tagsId } }, currentPost.id.toString());
            })
                .then(() => this._userRepository.findOneUser({ _id: currentPost.author.id }))
                .then(user => {
                // user.postCount--;
                //return UserRepository.saveOneUser(user);
            })
                .then(() => this._postRepository.removeOnePost(currentPost));
        };
        //Favorite
        this.addFavorited = (req, res) => {
            this.addOrDeleteFavorited(req, res, constants_1.constants.operation.add_favorited);
        };
        this.deleteFavorited = (req, res) => {
            this.addOrDeleteFavorited(req, res, constants_1.constants.operation.delete_favorited);
        };
        this.addOrDeleteFavorited = (req, res, action) => {
            const { currentUser } = this._serialize.getCurrentUserFromBody(req.body);
            const id = req.params.id;
            const { error } = this._validate.byId({ id });
            if (error)
                return this._validate.sendError(error, res);
            let currentPost;
            this._postRepository.findOnePost({ _id: id })
                .then(post => {
                if (action == constants_1.constants.operation.add_favorited) {
                    post.favouritesCount++;
                    post.favorites.push(currentUser._id);
                    currentPost = post.toObject();
                    currentPost.favorited = true;
                    currentUser.favorites.push(post._id);
                }
                else {
                    post.favouritesCount--;
                    post.favorites = post.favorites.filter(user => user.id !== currentUser.id);
                    currentPost = post.toObject();
                    currentUser.favorites = currentUser.favorites.filter(el => el.id !== post.id);
                }
                Object.assign(currentPost, { id: post.id });
                return this._postRepository.saveOnePost(post);
            })
                .then(() => this._userRepository.saveOneUser(currentUser))
                .then(() => res.send({ post: this._serialize.getPost(currentPost) }))
                .catch(e => this._validate.sendError(e, res));
        };
        this._validate = new validate_1.Validate();
        this._serialize = new serialize_1.Serialize();
        this._postRepository = new postRepository_1.PostRepository();
        this._userRepository = new userRepository_1.UserRepository();
        this._tagRepository = new tagRepository_1.TagRepository();
        this._commentRepository = new commentRepository_1.CommentRepository();
        this._tagController = new tagController_1.TagController();
        this._userController = new userController_1.UserController();
    }
}
exports.PostController = PostController;
//# sourceMappingURL=postController.js.map