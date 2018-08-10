import { Response } from "express";
import { constants } from "../constants";
import { Serialize } from "../utils/serialize";
const Joi = require('joi');

export class Validate{
    private _serialize: Serialize;
    constructor(){
        this._serialize = new Serialize();
    }

    public byId(id: object) {
        const schema = {
            id: Joi.string().min(24).max(24).required(),
        }
        return Joi.validate(id, schema);
    }

    public byToken(token: any){
        if(token === 'null'){
            token = null;
        }

        const schema = {
            token: Joi.string().required().error(() => constants.errors.invalid_token)
        }

        return Joi.validate({token}, schema);
    }

    public byRegister(user: object){
        const schema = {
            username: Joi.string().required().error(() => constants.errors.property_is_empty('Username')),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).min(6).required()
        }
        return Joi.validate(user, schema);
    }

    public byLogin(user: object){
        const schema = {
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
        }
        return Joi.validate(user, schema);
    }

    public byUpdateUser(user: object) {
        const schema = {
            image: Joi.string().trim().allow(""),
            username: Joi.string().required().error(() => constants.errors.property_is_empty('Username')),
            email: Joi.string().email().required().error(() => constants.errors.property_is_empty('Email')),
            bio: Joi.string().trim().allow("")
        }
        return Joi.validate(user, schema);
    }

    public byComment = (comment: object) => {
        const schema = {
            text: Joi.string().trim().required().error(() => constants.errors.property_is_empty('Text')),
            postId: Joi.string().required(),
        }
        return Joi.validate(comment, schema);
    }

    public byDeleteComment = (comment: object) => {
        const schema = {
            commentId: Joi.string().trim().required(),
            postId: Joi.string().required(),
        }
        return Joi.validate(comment, schema);
    }
    
    public sendError(error: any, res: Response){
        let message = error;

        switch(message){

            default:
                res.send(this._serialize.error(message));
        }
    }

}