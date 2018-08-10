import { Model, Document } from "mongoose";
import CommentModel from "../models/Comment";
import { IComment } from "interfaces/IComment";
import { constants } from "../constants";

export class CommentRepository{
    private _model: Model<Document>;

    constructor(){
        this._model = CommentModel;
    }

    public createNewModel(params: any){
        const model = new this._model(params);
        return <IComment>model;
    }

    public findOneComment = (params: object) => {
        return this._model.findOne(params)
            .then(
                this.returnOneComment,
                this.catchError
            )
    }

    public findComments = (params: object) => {
        return this._model.find(params)
            .then(
                this.returnComments,
                this.catchError
            )
    }

    public saveOneComment = (comment: IComment) => {
        return comment.save()
            .then(
                this.returnOneComment,
                this.catchError
            )
    }

    public removeOneComment = (comment: IComment) => {
        return comment.remove()
            .then(
                this.returnOneComment,
                this.catchError
            )
    }

    public removeComments = (params: object) => {
        return this._model.deleteMany(params)
            .then(
                this.returnComments,
                this.catchError
            )
    }

    
    private returnOneComment = (comment: Document | null) => {
        if(!comment) return Promise.reject(constants.errors.no_found_comment);
        return Promise.resolve(<IComment>comment);
    }

    private returnComments = (comments: Document[]) => {
        if(comments.length === 0) return Promise.reject(constants.errors.no_found_comment);
        return Promise.resolve(comments as Array<IComment>);
    }

    private catchError = (error: any) => Promise.reject(error)
}