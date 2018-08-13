import { Model, Document } from "mongoose";
import PostModel from "../models/Post";
import { constants } from "../constants";
import { IPost } from "interfaces/IPost";
import { IAggregate } from "interfaces/IAggregate";


export class PostRepository{
    private _model: Model<Document>;
    
    constructor(){
        this._model = PostModel;
    }

    public createNewPost(params: any){
        const model = new this._model(params);
        return <IPost>model;
    }

    public findPostsWithPagination = (params: object, aggregate: IAggregate) => {
        const request = this._model
            .find(params)
            .sort('-createdAt')
            .skip(aggregate.offset)
            .limit(aggregate.limit)
            .exec();

        return Promise.resolve(request)
            .then(
                this.returnPosts,
                this.catchError
            )
    }

    public findOnePost = (params: object) => {
        return this._model.findOne(params)
            .then(
                this.returnOnePost,
                this.catchError
            )
    }

    public findPosts = (params: object) => {
        return this._model.find(params)
            .then(
                this.returnPosts,
                this.catchError
            )
    }

    public updateOnePost = (params: object, currentPost: any) => {
        return this._model.findOneAndUpdate(params, currentPost, {new: true})
            .then(
                this.returnOnePost,
                this.catchError
            )
    }

    public saveOnePost = (currentPost: Document) => {
        return currentPost.save()
            .then(
                this.returnOnePost,
                this.catchError
            )
    }

    public removeOnePost = (currentPost: Document) => {
        return currentPost.remove()
            .then(
                this.returnOnePost,
                this.catchError
            )
    }

    private returnOnePost = (post: Document | null) => {
        if(!post) return Promise.reject(constants.errors.no_found_post);
        return Promise.resolve(<IPost>post);
    }

    private returnPosts = (posts: Document[]) => {
        if(posts.length === 0) return Promise.reject(constants.errors.no_found_post);
        return Promise.resolve(posts as Array<IPost>);
    }

    private catchError = (error: any) => Promise.reject(error);
}