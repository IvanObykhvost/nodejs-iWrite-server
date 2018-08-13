import { Model, Document } from "mongoose";
import TagModel from "../models/Tag";
import { constants } from "../constants";
import { ITag } from "interfaces/ITag";

export class TagRepository{
    private _model: Model<Document>;

    constructor(){
        this._model = TagModel;
    }

    public createNewTag = (params: any) => {
        const model = new this._model(params);
        return <ITag>model;
    }

    public getPopularTags = () => {
        const tags = this._model
            .aggregate([{
                '$match': {
                    'popular': {'$gte' : 1}
                }
            }])
            .sort({ popular: 'desc', text: 'asc'})
            .limit(20)
            .exec();

        return Promise.resolve(tags)
            .then(
                this.returnTags,
                this.catchError
            )
    }

    public findOneTag = (params: object) => {
        return this._model.findOne(params)
            .then(
                this.returnOneTag,
                this.catchError
            )
    }

    public findTags = (params: object) => {
        return this._model.find(params)
            .then(
                this.returnTags,
                this.catchError
            )
    }

    public saveOneTag = (tag: ITag) => {
        return tag.save()
            .then(
                this.returnOneTag,
                this.catchError
            )
    }

    public saveAllTags = (tags: ITag[]) => {
        return this._model.insertMany(tags)
            .then(
                this.returnTags,
                this.catchError
            )
    }

    public createNewTagsAndSaveAll = (tags: any, postId: String) => {
        //inProgress
    }

    public deleteRefPostInTag = (params: object, postId: string) => {
        // return this.findTags(params)
        //     .then(
        //         tags => {
        //             tags = tags.map(tag => {
        //                 tag.popular -=1;
        //                 tag.post = tag.post.
        //             })
        //         },
        //         this.catchError
        //     )
        //     .then(
        //         this.returnTags,
        //         this.catchError
        //     )
    }
    
    private returnOneTag = (tag: Document | null) => {
        if(!tag) return Promise.reject(constants.errors.no_found_tag);
        return Promise.resolve(<ITag>tag);
    }

    private returnTags = (tags: Document[]) => {
        if(tags.length === 0) return Promise.reject(constants.errors.no_found_comment);
        return Promise.resolve(tags as Array<ITag>);
    }

    private catchError = (error: any) => Promise.reject(error)
}