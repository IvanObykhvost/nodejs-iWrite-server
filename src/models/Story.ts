import { Schema, model } from "mongoose";

const StorySchema = new Schema({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    longDescription: {type: String, required: true},
    disableComments: {type: Boolean, default: false},
    disableRatings: {type: Boolean, default: false},
    status: {type: String, required: true},

    
    favorited: {type: Boolean, default: false},
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    favouritesCount: {type: Number, default: 0},
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'categories'
    }],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},   
    author: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }]
},
{
    versionKey: false
});

StorySchema.pre('find', function() {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('categories');
});

StorySchema.pre('findOne', function() {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('categories');
});

StorySchema.pre('findOneAndUpdate', function(next) {
    this.update({}, {updatedAt: new Date()});
    next();
});

StorySchema.pre('save', function(next) {
    this.populate('author').execPopulate();
    next();
});

export default model('stories', StorySchema);