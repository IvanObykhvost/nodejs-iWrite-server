const constants = require('../constants');
const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    text: {type: String, required: true},
    post:  [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    }],
    popular: {type: Number, default: 1}
},
{
    versionKey: false
});

const TagRepository = mongoose.model('tags', TagSchema);

/**
* Use by look for user
* @method  getOneUserByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @returns {Object} user or error
*/
TagRepository.getPopularTagsByParams = () => {

    let tags = TagRepository
        .aggregate()
        .sort({ popular: 'desc', text: 'asc'})
        .limit(10)
        .exec();

    return tags
        .then(
            tags => tags,
            error => Promise.reject(error)
        )
}

/**
* Use by look for user
* @method  getOneUserByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @returns {Object} user or error
*/
TagRepository.getOneTagbyParams = (findParams) => {
    return TagRepository.findOne(findParams)
        .then(tag => {
            if(!tag) return Promise.reject(constants.ERRORS.NO_FOUND_TAG)
            if(tag.errors) return Promise.reject(tag.errors);
            return tag;
        });
}

/**
* Use by look for user
* @method  getOneUserByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @returns {Object} user or error
*/
TagRepository.getTagsByParams = (findParams) => {
    return TagRepository.find(findParams)
        .then(tags => {
            if(tags.length === 0) return Promise.reject(constants.ERRORS.NO_FOUND_TAG)
            if(tags.errors) return Promise.reject(tags.errors);
            return tags;
        });
}

TagRepository.deleleRefPostByParams = (findParams, postId) => {
    return TagRepository.getTagsByParams(findParams)
        .then(tags => {
                tags = tags.map(tag => {
                    tag.popular--;
                    tag.post.pull(postId);
                    return tag;
                });
                return TagRepository.saveAllTags(tags, tags.length);
            },
            error => Promise.reject(error)
        )
        .then(
            tags => tags,
            error => Promise.reject(error)
        );
}

TagRepository.createNewTagsAndSaveAll = (tags, postId, ids) => {
    tags = tags.map(tag => { 
        return {
            text: tag, 
            post: postId
        }}
    )
    return TagRepository.insertAllTags(tags, ids)
        .then(
            resultTags => {
                resultTags.map(tag => ids.push(tag.id));
                return ids;
            },
            error => Promise.reject(error)
        )
}

TagRepository.saveOneTag = (tag) => {
    return tag.save()
        .then(tag => {
            if(!tag) return Promise.reject(constants.ERRORS.NO_FOUND_TAG)
            if(tag.errors) return Promise.reject(tag.errors);
            return tag;
        });
}

TagRepository.saveAllTags = (tags, length) => {
    if(length === 0)
        return;
    let tag = tags.pop();
    return TagRepository.saveOneTag(tag)
        .then(
            () => TagRepository.saveAllTags(tags, --length),
            error => Promise.reject(error)
        )
}

TagRepository.insertAllTags = (tags) => {
    return TagRepository.insertMany(tags)
        .then(
            tags => {
                if(tags === 0) return Promise.reject(constants.ERRORS.NO_FOUND_TAG)
                if(tags.errors) return Promise.reject(tags.errors);
                return tags;
            }
        )
}

// TagRepository.remove = (tag) => {
//     return tag.remove()
//         .then(tag => {
//             if(!tag) return Promise.reject(constants.ERRORS.NO_FOUND_TAG)
//             if(tag.errors) return Promise.reject(tag.errors);
//             return tag;
//         });
// }

module.exports = TagRepository;