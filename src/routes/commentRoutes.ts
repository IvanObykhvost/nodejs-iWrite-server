import { Router } from "express";
import { CommentController } from "../controllers/commentController";
import { AuthController } from "../controllers/authController";

export class CommentRoutes {
    public router: Router;
    private _commentController: CommentController;
    private _authController: AuthController;

    constructor(){
        this._commentController = new CommentController();
        this._authController = new AuthController();
        this.router = Router();
        this.routes();
    }

    public routes(): void{
        this.router.route('/')
            .get(this._commentController.getComments)
            .post(this._authController.authentication, this._commentController.addComment);
        
        this.router.route('/:commentId') 
            .delete(this._authController.authentication, this._commentController.deleteComment);

    }
}

const commentRoutes = new CommentRoutes();
commentRoutes.routes();

export default commentRoutes.router;