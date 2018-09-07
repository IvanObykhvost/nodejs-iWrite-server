"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PostSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    favorited: { type: Boolean, default: false },
    favorites: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'users'
        }],
    favouritesCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    tags: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'tags'
        }],
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
PostSchema.pre('find', function () {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('tags');
});
PostSchema.pre('findOne', function () {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('tags');
});
PostSchema.pre('findOneAndUpdate', function (next) {
    this.update({}, { updatedAt: new Date() });
    next();
});
PostSchema.pre('save', function (next) {
    this.populate('author').execPopulate();
    next();
});
exports.default = mongoose_1.model('posts', PostSchema);
//# sourceMappingURL=Post.js.map