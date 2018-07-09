const Joi = require('joi');
const serialize = require('./serialize').Serialize;
const constants = require('../constants');

function Validate(){
    this.byId = (id) => {
        const schema = {
            id: Joi.string().required(),
        }
        return Joi.validate(id, schema);
    },
    this.byToken = (token) => {
        if(token === "null") 
            token = null;

        const schema = {
            token: Joi.string().required(),
        }
        return Joi.validate({token}, schema);
    },
    this.byRegister = (user) => {
        const schema = {
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).min(6).required()
        }
        return Joi.validate(user, schema);
    },
    this.byPost = (post) => {
        const schema = {
            title: Joi.string().required(),
            topic: Joi.string().required(),
            message: Joi.string().required(),
            tags: Joi.string()
        }
        return Joi.validate(post, schema);
    },
    this.byUpdatePost = (post) => {
        const schema = {
            id: Joi.string().required(),
            title: Joi.string().required(),
            topic: Joi.string().required(),
            message: Joi.string().required(),
            tags: Joi.string()
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
            name: Joi.string().required()
        }
        return Joi.validate(user, schema);
    },
    this.byUpdateUser = (user) => {
        const schema = {
            image: Joi.string().trim().allow(""),
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            bio: Joi.string().trim().allow("")
        }
        return Joi.validate(user, schema);
    },
    this.returnError = (error, res) => {
        let message = error;
        if(error.details) {
            message = error.details[0].message;
        }
        if(error.message){
            message = error.message;
        }
        switch(message){
            case constants.ERRORS.NO_FOUND_FOLLOWS:
            case constants.ERRORS.NO_FOUND_POST:
                res.send([]);
                break;
                
            default:
                res.send(serialize.error(message));
        }
        
    }
}

module.exports.Validate = new Validate();