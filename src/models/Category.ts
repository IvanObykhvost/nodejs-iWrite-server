import { Schema, model } from "mongoose";

const CategorySchema = new Schema({
    text: {type: String, required: true},
    stories:  [{
        type: Schema.Types.ObjectId,
        ref: 'stories'
    }],
},
{
    versionKey: false
});

export default model('categories', CategorySchema);