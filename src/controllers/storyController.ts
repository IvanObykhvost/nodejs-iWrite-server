import { Request, Response } from "express";
import { Serialize } from "../utils/serialize";
import { Validate } from "../utils/validate";
import { IStory } from "interfaces/IStory";
import { constants } from "../constants";
import { StoryRepository } from "../repository/storyRepository";
import { CategoryController } from "../controllers/CategoryController";


export class StoryController{
    private _validate: Validate;
    private _serialize: Serialize;
    private _storyRepository: StoryRepository;
    private _categoryController: CategoryController;
    
    constructor(){
        this._validate = new Validate();
        this._serialize = new Serialize();        
        this._storyRepository = new StoryRepository();        
        this._categoryController = new CategoryController();
    }

    public addNewStory = (req: Request, res: Response) => {
        const { body, currentUser} = this._serialize.getCurrentUserFromBody(req.body);
        //const {error} = this._validate.byStory(body);
        //if(error) {
        //    return this._validate.sendError(error, res);
        //}

        let newStory = this._serialize.setNewStory(body, currentUser);        
        let newStoryModel = this._storyRepository.createNewStory({...newStory});
        let currentStory: IStory;

        this._storyRepository.saveOneStory(newStoryModel)
            .then(story => {
                currentStory = story;
                return this._categoryController.addRefStoryInCategory(newStory.categories, story)
            })
            .then(() => res.send({
                story: this._serialize.getStory(currentStory),
                success: constants.message.successfully_added
            }))
            .catch(e => this._validate.sendError(e, res));
    }

    public updateStory = (req: Request, res: Response) => {
        //const {error: errorId} = this._validate.byId(req.params);
        //if(errorId) return this._validate.sendError(errorId, res);
        
        let { body, currentUser} = this._serialize.getCurrentUserFromBody(req.body);
        
        let updateStory = this._serialize.setUpdateStory(body);
        let currentStory: IStory;

        /*const {error} = this._validate.byUpdatePost(updatePost);
        if(error) return this._validate.sendError(error, res);*/
        

        this._storyRepository.findOneStory({_id: updateStory.id})
        //detach story form categories
            .then(story => this._categoryController.deleteRefStoryInCategory(story.categories, story.id))
        //update story
            .then(() => this._storyRepository.updateOneStory({_id: updateStory.id}, updateStory))
        //add story ref to category(ies)
            .then(story => {
                currentStory = story;
                return this._categoryController.addRefStoryInCategory(updateStory.categories, story)
            })
            .then(() => res.send({
                story: this._serialize.getStory(currentStory),
                success: constants.message.succesfully_updated_post
            }))
            .catch(e => this._validate.sendError(e, res));
    }


    public getOneStory = (req: Request, res: Response) => {
        const id = req.params.id;
       
        const {error} = this._validate.byId({id});
        if(error) return this._validate.sendError(error, res); 

        this._storyRepository.findOneStory({_id: id})
            .then(story => res.send({story: this._serialize.getStory(story)}))
            .catch(e => this._validate.sendError(e, res));
    }
}