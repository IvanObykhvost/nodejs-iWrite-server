import { Model, Document } from "mongoose";
import UserModel from "../models/User";
import { IUser } from "interfaces/IUser";
import { constants } from "../constants";
const bcrypt = require('bcrypt-nodejs');

export class UserRepository{
    private _model: Model<Document>;
    constructor(){
        this._model = UserModel;
    }

    public createNewModel = (params: any) => {
        const model: Document = new this._model(params);
        let user = <IUser>model;
        user.password = bcrypt.hashSync(user.password);
        return user;
    }

    public findOneUser = (params: object) => {
        return this._model.findOne(params)
            .then(
                this.returnOneUser,
                this.catchError
            )
    }

    public findUsers = (params: object) => {
        return this._model.find(params)
            .then(
                this.returnUsers,
                this.catchError
            )
    }

    public updateOneUser = (params: object, user: object) => {
        return this._model.findOneAndUpdate(params, user, {new: true})
            .then(
                this.returnOneUser,
                this.catchError
            )
    }

   

    public saveAllusers = (users: any[]) => {
        const models = users as Document[];
        return models.forEach(doc => this.saveOneUser(doc));
    }

    public saveOneUser = (user: any) => {
        return (user as Document).save()
            .then(
                this.returnOneUser,
                this.catchError
            )
    }

    public getOneFollowingFlag = (token: string | undefined, id: string) => {
        return this.findOneUser({token})
            .then(
                user => user.followings.some(el => el.id.toString() === id),
                this.catchError
            )
    }

    private returnOneUser = (user: Document | null) => {
        if(!user) return Promise.reject(constants.errors.no_found_user);
        return Promise.resolve(<IUser>user);
    }

    private returnUsers = (users: Document[]) => {
        if(users.length === 0) return Promise.reject(constants.errors.no_found_user);
        return Promise.resolve(users as IUser[]);
    }

    private catchError = (error: any) => Promise.reject(error)
}