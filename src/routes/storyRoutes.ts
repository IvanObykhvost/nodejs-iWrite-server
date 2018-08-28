import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { StoryController } from "../controllers/storyController";

export class StoryRoutes {
    router: Router;    
    private _authController: AuthController;
    private _storyController: StoryController;

    constructor(){     
        this._authController = new AuthController();
        this._storyController = new StoryController();
        this.router = Router();
        this.routes();
    }

    public routes(): void{
        this.router.post('/', this._authController.authentication, this._storyController.addNewStory);      
        
        this.router.route('/:id')
            .get(this._storyController.getOneStory)
            .put(this._authController.authentication, this._storyController.updateStory)
    }
}

const storyRoutes = new StoryRoutes();
storyRoutes.routes();

export default storyRoutes.router;