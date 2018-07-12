const PostRepository = require('../repository/postRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;
const _ = require('lodash');

function TagController(){
    this.getPopularTags = (req, res) => {

        PostRepository.getPostsByParams({tags: {$gt: 0}})
            .then(
                posts => {
                    let allTags = [];
                    posts.map(post => post.tags.map(tag => allTags.push({name: tag, count: 1})));
                    let result = _(allTags)
                        .groupBy('name')
                        .map((items, name) => {
                            return {
                                name,
                                count: _.sumBy(items, 'count')
                            }
                        })
                        .value();
                        
                    result = _.orderBy(result, ['count', 'name'], ['desc', 'asc']);
                    result = _.filter(result, tag => tag.count > 1);
                    result = _.take(result, 20);
                    result = result.map(tag => tag.name);
                    res.send(result);
            },
                error =>  {throw error}
            )
            .catch(e => validate.sendError(e, res))
    }
}

module.exports = new TagController;