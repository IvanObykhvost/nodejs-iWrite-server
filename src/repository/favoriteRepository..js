const ERRORS = require('../constants').ERRORS;

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

FavoriteRepository.getOneFavoriteByParams = (findParams) => {
    return FavoriteRepository.model.findOne(findParams)
        .then(favorite => {
            if(favorite) return Promise.reject(ERRORS.NO_FOUND_FAVORITE);
            if(favorite.errors) return Promise.reject(favorite.errors);

            return favorite;
        })
}

module.exports = FavoriteRepository;