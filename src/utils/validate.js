const Joi = require('joi');

function Validate(){
    this.byId = (id) => {
        const schema = {
            id: Joi.string().required(),
        }
        return Joi.validate(id, schema);
    },
    this.byToken = (token) => {
        const schema = {
            token: Joi.string().required(),
        }
        return Joi.validate(token, schema);
    },
    this.byRegister = (user) => {
        const schema = {
            name: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required(),
        }
        return Joi.validate(user, schema);
    },
    this.byPost = (post) => {
        const schema = {
            title: Joi.string().required(),
            topic: Joi.string().required(),
            message: Joi.string().required(),
            tags: Joi.string(),
        }
        return Joi.validate(post, schema);
    },
    this.byLogin = (user) => {
        const schema = {
            email: Joi.string().required(),
            password: Joi.string().required()
        }
        // return Joi.validate(user, schema);
        return Joi.validate(user, schema);
    }
}

module.exports.Validate = new Validate();