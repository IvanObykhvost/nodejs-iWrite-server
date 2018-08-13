import { Router } from "express";
import { PostController } from "../controllers/postController";
import { AuthController } from "../controllers/authController";

export class UserRoutes {
    router: Router;
    private _postController: PostController;
    private _authController: AuthController

    constructor(){
        this._postController = new PostController();
        this._authController = new AuthController();
        this.router = Router();
        this.routes();
    }

    public routes(): void{
        this.router.get('/all', this._postController.getAllPosts);
        this.router.get('/feed', this._authController.authentication, this._postController.getPostsByFeed);
        this.router.post('/', this._authController.authentication, this._postController.addNewPost)
        this.router.route('/:id')
            .get(this._postController.getOnePost)
            .put(this._authController.authentication, this._postController.updatePost)
            .delete(this._authController.authentication, this._postController.deletePost)
        this.router.post('/:id/favorite', this._authController.authentication, this._postController.addFavorited);
        this.router.delete('/:id/unfavorite', this._authController.authentication, this._postController.deleteFavorited);
    }
}

const userRoutes = new UserRoutes();
userRoutes.routes();

export default userRoutes.router;