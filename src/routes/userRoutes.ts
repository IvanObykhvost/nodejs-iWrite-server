import { Router } from "express";
import { UserController } from "../controllers/userController";
import { AuthController } from "../controllers/authController";

export class UserRoutes {
    public router: Router;
    private _userController: UserController;
    private _authController: AuthController;

    constructor(){
        this._userController = new UserController();
        this._authController = new AuthController();
        this.router = Router();
        this.routes();
    }

    public routes(): void{
        this.router.get('/', this._userController.getUserByToken);
        this.router.put('/', this._authController.authentication, this._userController.saveUserSetting);
        this.router.post('/register', this._userController.registerUser);
        this.router.post('/login', this._userController.login)

    }
}

const userRoutes = new UserRoutes();
userRoutes.routes();

export default userRoutes.router;