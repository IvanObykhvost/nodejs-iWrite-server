import { Schema, model } from "mongoose";

const PostSchema = new Schema({
    title: {type: String, required: true},
    message: {type: String, required: true},
    favorited: {type: Boolean, default: false},
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    favouritesCount: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    tags:  [{
        type: Schema.Types.ObjectId,
        ref: 'tags'
    }],
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

PostSchema.pre('find', function() {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('tags');
});

PostSchema.pre('findOne', function() {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('tags');
});

PostSchema.pre('findOneAndUpdate', function(next) {
    this.update({}, {updatedAt: new Date()});
    next();
});

PostSchema.pre('save', function(next) {
    this.populate('author').execPopulate();
    next();
});

export default model('posts', PostSchema);