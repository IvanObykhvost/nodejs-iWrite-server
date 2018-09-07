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
            name: Joi.string().required().error(() => constants.errors.property_is_empty('Username')),
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

    public byUsername(user: object) {
        const schema = {
            name: Joi.string().required().error(() => constants.errors.property_is_empty('Name'))
        }
        return Joi.validate(user, schema);
    }

    public byUpdateUser(user: object) {
        const schema = {
            image: Joi.string().trim().allow(""),
            name: Joi.string().required().error(() => constants.errors.property_is_empty('Username')),
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
    

    public byPost = (post: object) => {
        const schema = {
            title: Joi.string().required().error(() => constants.errors.property_is_empty('Title')),
            message: Joi.string().required().error(() => constants.errors.property_is_empty('Message')),
            tags: Joi.array()
        }
        return Joi.validate(post, schema);
    }

    public byStory = (story: object) => {
        const schema = {
            title: Joi.string().required().error(() => constants.errors.property_is_empty('Title')),
            shortDescription: Joi.string().required().error(() => constants.errors.property_is_empty('Short Description')),
            longDescription: Joi.string().required().error(() => constants.errors.property_is_empty('Long Description')),
            status: Joi.string().required().error(() => constants.errors.property_is_empty('Status')),
        }
        return Joi.validate(story, schema);
    }

    public byUpdatePost = (post: object) => {
        const schema = {
            id: Joi.string().required(),
            title: Joi.string().required().error(() => constants.errors.property_is_empty('Title')),
            message: Joi.string().required().error(() => constants.errors.property_is_empty('Message')),
            tags: Joi.array()
        }
        return Joi.validate(post, schema);
    }

    public sendError(error: any, res: Response){
        let message = error;
        if(error.details) {
            message = error.details[0].message;
        }
        else if(error.message) {
            message = error.message.substring(error.message.indexOf('[')+1, error.message.indexOf(']'));
        }

        switch(message){
            case constants.errors.no_found_followers:
                res.send({followers: [], count: 0});
                break;

            case constants.errors.no_found_feed:
            case constants.errors.no_found_post:
                res.send({posts: [], count: 0});
                break;

            case constants.errors.no_found_comment:
            case constants.errors.no_found_tag:
                res.send([]);
                break;

            default:
                res.send(this._serialize.error(message));
        }
    }

}