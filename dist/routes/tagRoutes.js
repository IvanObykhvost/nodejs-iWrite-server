"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tagController_1 = require("../controllers/tagController");
class TagRoutes {
    constructor() {
        this._tagController = new tagController_1.TagController();
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.route('/')
            .get(this._tagController.getPopularTags);
    }
}
exports.TagRoutes = TagRoutes;
const tagRoutes = new TagRoutes();
tagRoutes.routes();
exports.default = tagRoutes.router;
//# sourceMappingURL=tagRoutes.js.map