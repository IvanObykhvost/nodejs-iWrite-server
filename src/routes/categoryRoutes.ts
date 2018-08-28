import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";

export class CategoryRoutes {
    public router: Router;
    private _categoryController: CategoryController;

    constructor(){
        this._categoryController = new CategoryController();
        this.router = Router();
        this.routes();
    }

    public routes(): void{
        this.router.route('/').get(this._categoryController.getAllCategories)
    }
}

const categoryRoutes = new CategoryRoutes();
categoryRoutes.routes();

export default categoryRoutes.router;