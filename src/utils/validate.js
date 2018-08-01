const Joi = require('joi');
const serialize = require('./serialize').Serialize;
const constants = require('../constants');

function Validate(){
    this.byId = (id) => {
        const schema = {
            id: Joi.string().min(24).max(24).required(),
        }
        return Joi.validate(id, schema);
    },
    this.byToken = (token) => {
        if(token === "null") 
            token = null;

        const schema = {
            token: Joi.string().required().error(() => constants.ERRORS.INVALID_TOKEN)
        }
        return Joi.validate({token}, schema);
    },
    this.byRegister = (user) => {
        const schema = {
            name: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Name')),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).min(6).required()
        }
        return Joi.validate(user, schema);
    },
    this.byPost = (post) => {
        const schema = {
            title: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Title')),
            topic: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Topic')),
            message: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Message')),
            tags: Joi.array()
        }
        return Joi.validate(post, schema);
    },
    this.byUpdatePost = (post) => {
        const schema = {
            id: Joi.string().required(),
            title: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Title')),
            topic: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Topic')),
            message: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Message')),
            tags: Joi.array()
        }
        return Joi.validate(post, schema);
    },
    this.byLogin = (user) => {
        const schema = {
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
        }
        return Joi.validate(user, schema);
    },
    this.byUsername = (user) => {
        const schema = {
            name: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Name'))
        }
        return Joi.validate(user, schema);
    },
    this.byUpdateUser = (user) => {
        const schema = {
            image: Joi.string().trim().allow(""),
            name: Joi.string().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Username')),
            email: Joi.string().email().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Email')),
            bio: Joi.string().trim().allow("")
        }
        return Joi.validate(user, schema);
    },
    this.byComment = (comment) => {
        const schema = {
            text: Joi.string().trim().required().error(() => constants.ERRORS.PROPERTY_IS_EMPTY('Text')),
            postId: Joi.string().required(),
        }
        return Joi.validate(comment, schema);
    },
    this.byDeleteComment = (comment) => {
        const schema = {
            commentId: Joi.string().trim().required(),
            postId: Joi.string().required(),
        }
        return Joi.validate(comment, schema);
    },
    this.returnError = (error, message) => {
        if(error)
            return {error: message}
        return error;
    },
    this.sendError = (error, res) => {
        let message = error;
        // if(error.details) {
        //     message = error.details[0].message;
        // }
        if(error.message){
            message = error.message.substring(error.message.indexOf('[')+1, error.message.indexOf(']'));
        }

        switch(message){
            case constants.ERRORS.NO_FOUND_COMMENTS:
                res.send([]);
                break;

            case constants.ERRORS.NO_FOUND_FOLLOWS:
                res.send({followers: [], count: 0});
                break;
            case constants.ERRORS.NO_FOUND_FEED:
            case constants.ERRORS.NO_FOUND_POSTS:
                res.send({posts: [], count: 0});
                break;
                
            default:
                res.send(serialize.error(message));
        }
    }
}

module.exports.Validate = new Validate();