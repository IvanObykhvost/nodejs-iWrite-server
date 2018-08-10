import { Router } from "express";
import { PostController } from "../controllers/postController";

export class UserRoutes {
    router: Router;
    private _postController: PostController;

    constructor(){
        this._postController = new PostController();
        this.router = Router();
        this.routes();
    }

    public routes(): void{
        this.router.get('/posts', this._postController.getAllPosts);

    }
}

const userRoutes = new UserRoutes();
userRoutes.routes();

export default userRoutes.router;