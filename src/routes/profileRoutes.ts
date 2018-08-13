import { Router } from "express";
import { ProfileController } from "../controllers/profileController";
import { AuthController } from "../controllers/authController";

export class ProfileRoutes {
    public router: Router;
    private _profileController: ProfileController;
    private _authController: AuthController;

    constructor(){
        this._profileController = new ProfileController();
        this._authController = new AuthController();
        this.router = Router();
        this.routes();
    }

    public routes(): void{
        this.router.get('/', this._profileController.getProfile);
        this.router.get('/followers', this._profileController.getFollowers);
        this.router.get('/following', this._profileController.getFollowing);
        this.router.post('/follow', this._authController.authentication, this._profileController.follow);
        this.router.delete('/unfollow', this._authController.authentication, this._profileController.unfollow);
    }
}

const profileRoutes = new ProfileRoutes();
profileRoutes.routes();

export default profileRoutes.router;