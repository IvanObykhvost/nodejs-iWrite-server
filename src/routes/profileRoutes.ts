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
        this.router.get('/:username/', this._profileController.getProfile);
        this.router.get('/:username/followers', this._profileController.getFollowers);
        this.router.get('/:username/following', this._profileController.getFollowing);
        this.router.post('/:username/follow', this._authController.authentication, this._profileController.follow);
        this.router.delete('/:username/unfollow', this._authController.authentication, this._profileController.unfollow);
    }
}

const profileRoutes = new ProfileRoutes();
profileRoutes.routes();

export default profileRoutes.router;