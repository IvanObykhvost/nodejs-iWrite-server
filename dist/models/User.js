"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const generateToken_1 = require("../utils/generateToken");
const generate = new generateToken_1.Generate();
const UserSchema = new mongoose_1.Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    name: {
        type: String,
        default: '',
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        default: '',
        required: true,
        unique: true
    },
    password: {
        type: String,
        default: '',
        required: true,
        unique: true
    },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    token: { type: String, default: generate.getToken() },
    following: { type: Boolean, required: false },
    followings: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'users'
        }],
    followers: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'users'
        }],
    favorites: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'posts'
        }],
    postCount: { type: Number, default: 0 }
}, {
    versionKey: false
});
UserSchema.pre('findOne', function (next) {
    this.populate('followings');
    this.populate('followers');
    this.populate('favorites');
    next();
});
UserSchema.post('find', function (error, doc, next) {
    doc.populate('favorites');
    next();
});
UserSchema.pre('findOneAndUpdate', function (next) {
    this.update({}, { updatedAt: new Date() });
    next();
});
exports.default = mongoose_1.model('users', UserSchema);
//# sourceMappingURL=User.js.map