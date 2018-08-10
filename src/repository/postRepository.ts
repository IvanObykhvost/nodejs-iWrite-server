import { Model, Document } from "mongoose";
import PostModel from "../models/Post";
import { constants } from "../constants";
import { IPost } from "interfaces/IPost";


export class PostRepository{
    private _model: Model<Document>;
    
    constructor(){
        this._model = PostModel;
    }

    public findOnePost(params: object) {
        return this._model.findOne(params)
            .then(
                post => {
                    if(!post) return Promise.reject(constants.errors.no_found_post);
                    return Promise.resolve(<IPost>post);
                },
                this.catchError
            )
    }

    public findPosts(params: object){
        return this._model.find(params)
            .then(
                this.returnPosts,
                this.catchError
            )
    }

    public saveOnePost(currentUser: Document){
        return currentUser.save()
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