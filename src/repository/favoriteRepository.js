const ERRORS = require('../constants').ERRORS;
const MESSAGE = require('../constants').MESSAGE;

const mongoose = require('mongoose');
const url = "mongodb://127.0.0.1:27017/node";
const option = { 
    useNewUrlParser: true 
}

mongoose.connect(url, option, (error) => {
    if(error) console.log(error);
    else console.log("FavoriteRepository connected");
});

const FavoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    }    
});

FavoriteSchema.pre('find', function() {
    this.populate('user');
    this.populate('post');
});

const FavoriteRepository = mongoose.model('favorites', FavoriteSchema);

/**
* Use by looking for one favorite
* @method  getOneFavoriteByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @return {Objects} favorite or error
*/
FavoriteRepository.getOneFavoriteByParams = async (findParams) => {
    return FavoriteRepository.findOne(findParams)
        .then(favorite => {
            if(!favorite) return Promise.reject(ERRORS.NO_FOUND_FAVORITE);
            if(favorite.errors) return Promise.reject(favorite.errors);
            return favorite;
        })
}

/**
* Use by looking for many favorites
* @method  getOneFavoriteByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @return {Array[Objects]} favorites or error
*/
FavoriteRepository.getFavoritesByParams = (findParams) => {
    return FavoriteRepository.find(findParams)
        .then(favorites => {
            if(favorites === 0) return Promise.reject(ERRORS.NO_FOUND_FAVORITE);
            if(favorites.errors) return Promise.reject(favorites.errors);
            return favorites;
        })
}

/**
* Use by looking for many favorites
* @method  getOneFavoriteByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @return {Array[Objects]} favorites or error
*/
FavoriteRepository.deleteFavoriteByParams = (findParams) => {
    return FavoriteRepository.findOneAndRemove(findParams)
        .then(favorite => {
            if(favorite.errors) return Promise.reject(favorite.errors);
            return MESSAGE.SUCCESSFULLY_REMOVED_FAVORITE;
        });
};

FavoriteRepository.getFavoriteFlag = (findParams) => {
    return FavoriteRepository.getOneFavoriteByParams(findParams)
        .then(
            () => true,
            error => {
                if(error === ERRORS.NO_FOUND_FAVORITE)
                    return false
                return Promise.reject(error);
            }
        );
}

module.exports = FavoriteRepository;