"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    stories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'stories'
        }],
}, {
    versionKey: false
});
exports.default = mongoose_1.model('categories', CategorySchema);
//# sourceMappingURL=Category.js.map