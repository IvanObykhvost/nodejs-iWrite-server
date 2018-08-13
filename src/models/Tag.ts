import { Schema, model } from "mongoose";

const TagSchema = new Schema({
    text: {type: String, required: true},
    posts:  [{
        type: Schema.Types.ObjectId,
        ref: 'posts'
    }],
    popular: {type: Number, default: 1}
},
{
    versionKey: false
});



export default model('tags', TagSchema);