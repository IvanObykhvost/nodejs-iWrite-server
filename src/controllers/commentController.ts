import { Request, Response } from "express";
import { Validate } from "../utils/validate";
import { Serialize } from "../utils/serialize";
import { PostRepository } from "../repository/postRepository";
import { CommentRepository } from "../repository/commentRepository";
import { constants } from "../constants";
import { IUser } from "interfaces/IUser";
import { IComment } from "interfaces/IComment";
import { IPost } from "interfaces/IPost";

export class CommentController{
    private _validate: Validate;
    private _serialize: Serialize;
    private _postRepository: PostRepository;
    private _commentRepository: CommentRepository;
    
    constructor(){
        this._validate = new Validate();
        this._serialize = new Serialize();
        this._postRepository = new PostRepository();
        this._commentRepository = new CommentRepository();
    }

    public getComments = (req: Request, res: Response) => {
        const postId = req.params.id;
        const {error} = this._validate.byId({id: postId});
        if(error) return this._validate.sendError(error, res);

        const aggregate = {
            limit: +req.query.limit, 
            offset: +req.query.offset
        };

        this._postRepository.findOnePost({_id: postId})
            .then(post => {
                post.comments = post.comments.sort((a: IComment, b: IComment) => b.createdAt.getTime() - a.createdAt.getTime());
                const count = post.comments.length;
                post.comments = post.comments.slice(aggregate.offset, aggregate.offset + aggregate.limit);
                res.send({
                    comments: post.comments.map(comment => this._serialize.getComment(comment)),
                    count
                });
            })
            .catch(e => this._validate.sendError(e, res))
    }

    public addComment = (req: Request, res: Response) => {
        const comment = {
            postId: req.params.id, 
            text: req.body.comment
        }
        const {currentUser} = this._serialize.getCurrentUserFromBody(req.body);
        const {error} = this._validate.byComment(comment);
        if(error) return this._validate.sendError(error, res);

        this.addOrDeleteComment(comment, currentUser, res, constants.operation.add_comment); 
    }

    public deleteComment  = (req: Request, res: Response) => {
        const comment = {
            postId: req.params.id, 
            commentId: req.params.commentId
        };
        const {currentUser} = this._serialize.getCurrentUserFromBody(req.body);
        const {error} = this._validate.byDeleteComment(comment);
        if(error) return this._validate.sendError(error, res);

        this.addOrDeleteComment(comment, currentUser, res, constants.operation.delete_comment); 
    }

    private addOrDeleteComment = (body: any, currentUser: IUser, res: Response, action: string) => {
        let currentPost: IPost;
        let currentComment: IComment;

        this._postRepository.findOnePost({_id: body.postId})
            .then(post => {
                currentPost = post;
                if(action === constants.operation.add_comment){
                    const comment = this._commentRepository.createNewModel({
                        text: body.text,
                        author: currentUser._id
                    });
                    return comment;
                }
                else{
                    return this._commentRepository.findOneComment({_id: body.commentId})
                }
            })
            .then(commmet => {
                if(action === constants.operation.add_comment)
                    return this._commentRepository.saveOneComment(commmet);
                return this._commentRepository.removeOneComment(commmet);
            })
            .then(comment =>{
                currentComment = comment;
                if(action === constants.operation.add_comment)
                    currentPost.comments.push(comment._id);
                else    
                    currentPost.comments = currentPost.comments.filter(el => el.id != comment.id);
                return this._postRepository.saveOnePost(currentPost);
            })
            .then(() => res.send({comment: this._serialize.getComment(currentComment)}))
            .catch(e => this._validate.sendError(e, res))
    }
}