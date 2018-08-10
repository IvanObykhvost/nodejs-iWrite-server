"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users'
    }
}, {
    versionKey: false
});
CommentSchema.pre('find', function () {
    this.populate('author');
});
CommentSchema.pre('findOne', function () {
    this.populate('author');
});
CommentSchema.pre('save', function (next) {
    this.populate('author').execPopulate();
    next();
});
CommentSchema.pre('remove', function (next) {
    this.populate('author').execPopulate();
    next();
});
exports.default = mongoose_1.model('comments', CommentSchema);
//# sourceMappingURL=Comment.js.map