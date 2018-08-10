import { Router } from "express";
import { TagController } from "../controllers/tagController";

export class TagRoutes {
    public router: Router;
    private _tagController: TagController;

    constructor(){
        this._tagController = new TagController();
        this.router = Router();
        this.routes();
    }

    public routes(): void{
        this.router.get('/', this._tagController.getPopularTags);
        // this.router.route('/')
        //     .get(this._tagController.getPopularTags)
    }
}

const tagRoutes = new TagRoutes();
tagRoutes.routes();

export default tagRoutes.router;