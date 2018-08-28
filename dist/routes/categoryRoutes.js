"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
class CategoryRoutes {
    constructor() {
        this._categoryController = new categoryController_1.CategoryController();
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.route('/').get(this._categoryController.getAllCategories);
    }
}
exports.CategoryRoutes = CategoryRoutes;
const categoryRoutes = new CategoryRoutes();
categoryRoutes.routes();
exports.default = categoryRoutes.router;
//# sourceMappingURL=categoryRoutes.js.map