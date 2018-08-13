import { Schema, model } from "mongoose";
import { Generate } from "../utils/generateToken";
const generate = new Generate();

const UserSchema: Schema = new Schema({
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
    following: {type: Boolean, required: false},
    followings: [{ //ты подписался на других
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    followers: [{ //это подписаны на тебя
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'posts'
    }],
    postCount: {type: Number, default: 0}
},
{
    versionKey: false
});

UserSchema.pre('findOne', function(next) {
    this.populate('followings');
    this.populate('followers');
    this.populate('favorites');
    next();
})

export default model('users', UserSchema);