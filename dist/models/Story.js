"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StorySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    disableComments: { type: Boolean, default: false },
    disableRatings: { type: Boolean, default: false },
    status: { type: String, required: true },
    favorited: { type: Boolean, default: false },
    favorites: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'users'
        }],
    favouritesCount: { type: Number, default: 0 },
    categories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'categories'
        }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users'
    },
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'comments'
        }]
}, {
    versionKey: false
});
StorySchema.pre('find', function () {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('categories');
});
StorySchema.pre('findOne', function () {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('categories');
});
StorySchema.pre('findOneAndUpdate', function (next) {
    this.update({}, { updatedAt: new Date() });
    next();
});
StorySchema.pre('save', function (next) {
    this.populate('author').execPopulate();
    next();
});
exports.default = mongoose_1.model('stories', StorySchema);
//# sourceMappingURL=Story.js.map