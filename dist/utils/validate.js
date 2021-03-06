"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const serialize_1 = require("../utils/serialize");
const Joi = require('joi');
class Validate {
    constructor() {
        this.byComment = (comment) => {
            const schema = {
                text: Joi.string().trim().required().error(() => constants_1.constants.errors.property_is_empty('Text')),
                postId: Joi.string().required(),
            };
            return Joi.validate(comment, schema);
        };
        this.byDeleteComment = (comment) => {
            const schema = {
                commentId: Joi.string().trim().required(),
                postId: Joi.string().required(),
            };
            return Joi.validate(comment, schema);
        };
        this.byPost = (post) => {
            const schema = {
                title: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Title')),
                message: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Message')),
                tags: Joi.array()
            };
            return Joi.validate(post, schema);
        };
        this.byStory = (story) => {
            const schema = {
                title: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Title')),
                shortDescription: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Short Description')),
                longDescription: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Long Description')),
                status: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Status')),
            };
            return Joi.validate(story, schema);
        };
        this.byUpdatePost = (post) => {
            const schema = {
                id: Joi.string().required(),
                title: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Title')),
                message: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Message')),
                tags: Joi.array()
            };
            return Joi.validate(post, schema);
        };
        this._serialize = new serialize_1.Serialize();
    }
    byId(id) {
        const schema = {
            id: Joi.string().min(24).max(24).required(),
        };
        return Joi.validate(id, schema);
    }
    byToken(token) {
        if (token === 'null') {
            token = null;
        }
        const schema = {
            token: Joi.string().required().error(() => constants_1.constants.errors.invalid_token)
        };
        return Joi.validate({ token }, schema);
    }
    byRegister(user) {
        const schema = {
            name: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Username')),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).min(6).required()
        };
        return Joi.validate(user, schema);
    }
    byLogin(user) {
        const schema = {
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
        };
        return Joi.validate(user, schema);
    }
    byUsername(user) {
        const schema = {
            name: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Name'))
        };
        return Joi.validate(user, schema);
    }
    byUpdateUser(user) {
        const schema = {
            image: Joi.string().trim().allow(""),
            name: Joi.string().required().error(() => constants_1.constants.errors.property_is_empty('Username')),
            email: Joi.string().email().required().error(() => constants_1.constants.errors.property_is_empty('Email')),
            bio: Joi.string().trim().allow("")
        };
        return Joi.validate(user, schema);
    }
    sendError(error, res) {
        let message = error;
        if (error.details) {
            message = error.details[0].message;
        }
        else if (error.message) {
            message = error.message.substring(error.message.indexOf('[') + 1, error.message.indexOf(']'));
        }
        switch (message) {
            case constants_1.constants.errors.no_found_followers:
                res.send({ followers: [], count: 0 });
                break;
            case constants_1.constants.errors.no_found_feed:
            case constants_1.constants.errors.no_found_post:
                res.send({ posts: [], count: 0 });
                break;
            case constants_1.constants.errors.no_found_comment:
            case constants_1.constants.errors.no_found_tag:
                res.send([]);
                break;
            default:
                res.send(this._serialize.error(message));
        }
    }
}
exports.Validate = Validate;
//# sourceMappingURL=validate.js.map