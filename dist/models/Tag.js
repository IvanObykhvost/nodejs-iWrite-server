"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TagSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    posts: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'posts'
        }],
    popular: { type: Number, default: 1 }
}, {
    versionKey: false
});
exports.default = mongoose_1.model('tags', TagSchema);
//# sourceMappingURL=Tag.js.map