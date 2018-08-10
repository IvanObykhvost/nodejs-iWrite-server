import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
    text: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    author: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
},
{
    versionKey: false
});

CommentSchema.pre('find', function() {
    this.populate('author');
});

CommentSchema.pre('findOne', function() {
    this.populate('author');
});

CommentSchema.pre('save', function(next) {
    this.populate('author').execPopulate();
    next();
});

CommentSchema.pre('remove', function(next) {
    this.populate('author').execPopulate();
    next();
});

export default model('comments', CommentSchema);