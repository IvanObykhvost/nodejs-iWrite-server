import { Request, Response } from "express";
import { PostRepository } from "../repository/postRepository";
import { TagController } from "../controllers/tagController";
import { Serialize } from "../utils/serialize";
import { Validate } from "../utils/validate";
import { IPost } from "interfaces/IPost";
import { constants } from "../constants";
import { IUser } from "interfaces/IUser";
import { UserController } from "./userController";
import { IAggregate } from "interfaces/IAggregate";
import { UserRepository } from "../repository/userRepository";
import { TagRepository } from "../repository/tagRepository";
import { ITag } from "interfaces/ITag";

export class PostController{
    private _validate: Validate;
    private _serialize: Serialize;
    private _postRepository: PostRepository;
    private _userRepository: UserRepository;
    private _tagRepository: TagRepository;
    private _tagController: TagController;
    private _userController: UserController;
    
    constructor(){
        this._validate = new Validate();
        this._serialize = new Serialize();
        this._postRepository = new PostRepository();
        this._userRepository = new UserRepository();
        this._tagRepository = new TagRepository();
        this._tagController = new TagController();
        this._userController = new UserController();
    }

    public getAllPosts = (req: Request, res: Response) => {
        const token = req.headers.authorization;
        const aggregate: IAggregate = {
            limit: +req.query.limit, 
            offset: +req.query.offset
        };
        const {error} = this._validate.byToken(token);
        if(error){
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
            if(name) 
                return this.getAllPostsWithToken({name}, token, res, constants.operation.get_posts_by_author, aggregate);

            name = req.query.favorited;
            if(name) 
                return this.getAllPostsWithToken({name}, token, res, constants.operation.get_posts_by_favorited, aggregate);

            let tag = req.query.tag;
            if(tag)
                return this.getPostsByTag(tag, token, res, aggregate)

            return this.getAllPostsWithToken({token}, token, res, constants.operation.get_posts_by_token, aggregate);
        }

    }

    private getAllPostsWithToken = (params: object, token: string|undefined, res: Response, 
                                    action: string, aggregate: IAggregate) =>{
        if(action === constants.operation.get_posts_by_author || action === constants.operation.get_posts_by_favorited){
            const {error} = this._validate.byUsername(params);
            if(error) this._validate.sendError(error, res);
        }

        let paramsPosts = {};
        let currentUser: IUser;
        let author: IUser;

        this._userRepository.findOneUser(params)
            .then(user => {
                author = user;
                if(action === constants.operation.get_posts_by_author)
                    paramsPosts = {author: user._id}
                return this._userRepository.findOneUser({token});
            })
            .then(() => this._userRepository.findOneUser({token}))
            .then(user => {
                currentUser = user;
                return this._postRepository.findPosts(paramsPosts);
            })
            .then(posts =>{
                posts = posts.map(post => {
                    if(post.favorites.length > 0){
                        post.favorited = post.favorites.some(user => user.id === author.id);
                    }
                    return post;
                })
                if(action === constants.operation.get_posts_by_favorited){
                    posts = posts.filter(post => {
                        if(post.favorited)
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
    }

    public getPostsByFeed = (req: Request, res: Response) => {
        const { currentUser} = this._serialize.getCurrentUserFromBody(req.body);
        const aggregate: IAggregate = {
            limit: +req.query.limit,
            offset: +req.query.offset
        };

        let count = 0;
        let usersId: any = [];
        if(currentUser.followings.length === 0) 
            return this._validate.sendError(constants.errors.no_found_feed, res);
        usersId = currentUser.followings.map(user => user.id);

        this._postRepository.findPosts({author: {$in: usersId}})
            .then(posts => {
                count = posts.length;
                return this._postRepository.findPostsWithPagination({author: {$in: usersId}}, aggregate);
            })
            .then(posts => posts.map(post => {
                if(post.favorites.length > 0)
                    post.favorited = post.favorites.some(user => user.id === currentUser.id);
                return post;
            }))
            .then(posts => res.send(this._serialize.sendPosts(posts, count)))
            .catch(e => this._validate.sendError(e, res));
    }

    public getPostsByTag = (tag: string, token: string | undefined, res: Response, aggregate: IAggregate) => {
        let count = 0;
        let currentTag: ITag;
        let currentUser: IUser;

        this._userRepository.findOneUser({token})
            .then(user => {
                currentUser = user;
                return this._tagRepository.findOneTag({text: tag})
            })
            .then(tagModel => {
                currentTag = tagModel;
                return this._postRepository.findPosts({tags: currentTag._id})
            })
            .then(posts => {
                count = posts.length;
                return this._postRepository.findPostsWithPagination({tags: currentTag._id}, aggregate);
            })
            .then(posts => {
                posts = posts.map(post => {
                    if(post.favorites.length > 0)
                        post.favorited = post.favorites.some(user => user.id === currentUser.id);
                    return post;
                })
                res.send(this._serialize.sendPosts(posts, count));
            })
            .catch(e => this._validate.sendError(e, res));
    }

    public getOnePost = (req: Request, res: Response) => {
        const id = req.params.id;
        const {error} = this._validate.byId({id});
        if(error) return this._validate.sendError(error, res);

        this._postRepository.findOnePost({_id: id})
            .then(post => res.send({post: this._serialize.getPost(post)}))
            .catch(e => this._validate.sendError(e, res));
    }

    public addNewPost = (req: Request, res: Response) => {
        const { body, currentUser} = this._serialize.getCurrentUserFromBody(req.body);
        const {error} = this._validate.byPost(body);
        if(error) return this._validate.sendError(error, res);

        let currentPost: IPost;
        let newPost = this._postRepository.createNewPost({
            ...body,
            author: currentUser.id
        })

        // currentUser.postCount++;
        // this._userRepository.saveOneUser(currentUser)
        this._postRepository.saveOnePost(newPost)
            .then(post => {
                currentPost = post
                return this._tagController.saveTagsByPostId(body.tags, post)
            })
            .then(tags =>{
                tags.map(tag => currentPost.tags.push(tag))
                return this._postRepository.saveOnePost(currentPost);
            })
            .then(post => res.send({
                post: this._serialize.getPost(post),
                success: constants.message.successfully_added
            }))
            .catch(e => this._validate.sendError(e, res));
    }

    public updatePost = (req: Request, res: Response) => {
        const {error: errorId} = this._validate.byId(req.params);
        if(errorId) return this._validate.sendError(errorId, res);
        
        const { body, currentUser} = this._serialize.getCurrentUserFromBody(req.body);
        let updatePost = this._serialize.setUpdatePost(body);
        const {error} = this._validate.byUpdatePost(updatePost);
        if(error) return this._validate.sendError(error, res);

        this._postRepository.findOnePost({_id: updatePost.id})
            .then(post => {
                if(post.author.token !== currentUser.token)
                    throw constants.errors.no_post_owner;
                return this._tagController.saveTagsByPostId(body.tags, post._id);
            })
            .then(tagsId => {
                updatePost.tags = [];
                tagsId.map(tag => updatePost.tags.push(tag));
                return this._postRepository.updateOnePost({_id: updatePost.id}, updatePost)
            })
            .then(() => res.send(this._serialize.success(constants.message.succesfully_updated_post)))
            .catch(e => this._validate.sendError(e, res));
    }

    public deletePost = (req: Request, res: Response) => {
        const currentUser: IUser = req.body.currentUser;
        const postId = req.params.id;
        const {error} = this._validate.byId(req.params);
        if(error) return this._validate.sendError(error, res);

        let currentPost: IPost;

        // currentUser.postCount--;
        // this._userRepository.saveOneUser(currentUser)

        this._postRepository.findOnePost({_id: postId})
            .then(post => {
                if(post.author.id !== currentUser.id)
                    throw constants.errors.no_post_owner;
                currentPost = post;
                return this._userController.removeFavoriteFromUsers({favorites: postId});
            })
            .then(() => this._postRepository.removeOnePost(currentPost))
            .then(() => res.send(this._serialize.success(constants.message.successfully_removed_post)))
            .catch(e => this._validate.sendError(e, res));
    }

    //Favorite
    public addFavorited = (req: Request, res: Response) => {
        this.addOrDeleteFavorited(req, res, constants.operation.add_favorited);
    }

    public deleteFavorited = (req: Request, res: Response) => {
        this.addOrDeleteFavorited(req, res, constants.operation.delete_favorited);
    }

    private addOrDeleteFavorited = (req: Request, res: Response, action: string) => {
        const {currentUser} = this._serialize.getCurrentUserFromBody(req.body);
        const id = req.params.id;
        const {error} = this._validate.byId({id});
        if(error) return this._validate.sendError(error, res);

        let currentPost: IPost;

        this._postRepository.findOnePost({_id: id})
            .then(post => {
                if(action == constants.operation.add_favorited){
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
                return this._postRepository.saveOnePost(post);
            })
            .then(() => this._userRepository.saveOneUser(currentUser))
            .then(() => res.send({post: this._serialize.getPost(currentPost)}))
            .catch(e => this._validate.sendError(e, res));
    }
}