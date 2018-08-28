import { Model, Document } from "mongoose";
import StoryModel from "../models/Story";
import { constants } from "../constants";
import { IPost } from "interfaces/IPost";
import { IStory } from "interfaces/IStory";
import { IAggregate } from "interfaces/IAggregate";


export class StoryRepository{
    private _model: Model<Document>;
    
    constructor(){
        this._model = StoryModel;
    }

    public createNewStory(params: any){
        const model = new this._model(params);
        return <IStory>model;
    }


    public saveOneStory = (currentStory: Document) => {
        return currentStory.save()
            .then(
                this.returnOneStory,
                this.catchError
            )
    }

    public findOneStory = (params: object) => {
        return this._model.findOne(params)
            .then(
                this.returnOneStory,
                this.catchError
            )
    }

    public updateOneStory = (params: object, currentPost: any) => {
        return this._model.findOneAndUpdate(params, currentPost, {new: true})
            .then(
                this.returnOneStory,
                this.catchError
            )
    }

    private returnOneStory = (story: Document | null) => {
        if(!story) return Promise.reject(constants.errors.no_found_post);
        return Promise.resolve(<IStory>story);
    }   

    private catchError = (error: any) => Promise.reject(error);
}