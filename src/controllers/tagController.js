const PostRepository = require('../repository/postRepository');
const TagRepository = require('../repository/tagRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;
const _ = require('lodash');

function TagController(){
    this.getPopularTags = (req, res) => {

        TagRepository.getPopularTagsByParams({})
            .then(
                tags => {
                    let result = [];
                    result = tags.map(tag => tag.text);
                    res.send(result);
                },
                error =>  {throw error}
            )
            .catch(e => validate.sendError(e, res))
    },

    this.getPopularTag = (req, res) => {
        
    },

    this.saveTagsByPostId = (tags, postId) => {
        let ids = [];

        return TagRepository.getTagsByParams({post: postId})
            .then(
                resultTags => {
                    resultTags = resultTags.map(tag => {
                        tag.popular--;
                        tag.post.pull(postId);
                        return tag;
                    });
                    return TagRepository.saveAllTags(resultTags, resultTags.length);
                },
                error => {
                    if(error === constants.ERRORS.NO_FOUND_TAG){
                        return tags;
                    }
                    error => {throw error}
                }
            )
            .then(
                () => TagRepository.getTagsByParams({text: {$in: tags}}),
                error => {throw error}
            )
            .then(
                resultTags => {
                    let text = [];
                    resultTags = resultTags.map(tag => {
                        tag.popular++;
                        ids.push(tag.id);
                        text.push(tag.text);
                        tag.post.push(postId);
                        return tag;
                    });
                    tags = tags.filter(tag => !text.includes(tag));
                    return TagRepository.saveAllTags(resultTags, resultTags.length);
                },
                error => {
                    if(error === constants.ERRORS.NO_FOUND_TAG){
                        return tags;
                    }
                    error => {throw error}
                }
            )
            .then(
                () => TagRepository.createNewTagsAndSaveAll(tags, postId, ids),
                error => {throw error}
            )
            .then(
                resultId => resultId,
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res))
    }

}

module.exports = new TagController;