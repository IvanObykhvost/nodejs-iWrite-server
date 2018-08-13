"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../utils/validate");
const serialize_1 = require("../utils/serialize");
const constants_1 = require("../constants");
const tagRepository_1 = require("../repository/tagRepository");
class TagController {
    constructor() {
        this.getPopularTags = (req, res) => {
            this._tagRepository.getPopularTags()
                .then(tags => {
                const result = tags.map(tag => {
                    return tag.text;
                });
                res.send(result);
            })
                .catch(e => this._validate.sendError(e, res));
        };
        this.saveTagsByPostId = (tags, post) => {
            let ids = [];
            return this._tagRepository.findTags({ posts: post._id })
                .then(resultTags => {
                resultTags = resultTags.map(tag => {
                    tag.popular--;
                    tag.posts = tag.posts.filter(el => el.toString() !== post.id.toString());
                    return tag;
                });
                return this._tagRepository.saveAllTags(resultTags);
            }, error => {
                if (error === constants_1.constants.errors.no_found_tag)
                    return tags;
                throw error;
            })
                .then(() => this._tagRepository.findTags({ text: { $in: tags } }))
                .then(resultTags => {
                let text = [];
                resultTags = resultTags.map(tag => {
                    tag.popular++;
                    ids.push(tag);
                    text.push(tag.text);
                    tag.posts.push(post._id);
                    return tag;
                });
                tags = tags.filter(tag => !text.includes(tag));
                return this._tagRepository.saveAllTags(resultTags);
            }, error => {
                if (error === constants_1.constants.errors.no_found_tag)
                    return tags;
                throw error;
            })
                .then(() => {
                const newTags = tags.map(tag => this._tagRepository.createNewTag({
                    text: tag,
                    posts: post._id
                }));
                return this._tagRepository.insertAllTags(newTags);
            })
                .then(resultTags => {
                resultTags.map(tag => ids.push(tag));
                return ids;
            }, error => {
                if (error === constants_1.constants.errors.no_found_tag)
                    return ids;
                throw error;
            });
        };
        this.deleteRefPostInTag = (params, postId) => {
            return this._tagRepository.findTags(params)
                .then(tags => {
                tags = tags.map(tag => {
                    tag.popular--;
                    tag.posts = tag.posts.filter(el => el.id !== postId);
                    return tag;
                });
                return this._tagRepository.saveAllTags(tags);
            });
        };
        this._validate = new validate_1.Validate();
        this._serialize = new serialize_1.Serialize();
        this._tagRepository = new tagRepository_1.TagRepository();
    }
}
exports.TagController = TagController;
//# sourceMappingURL=tagController.js.map