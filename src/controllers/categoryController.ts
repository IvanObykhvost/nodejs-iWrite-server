import { Request, Response } from "express";
import { Validate } from "../utils/validate";
import { Serialize } from "../utils/serialize";
import { constants } from "../constants";
import { CategoryRepository } from "../repository/CategoryRepository";
import { IStory } from "interfaces/IStory";
import { ICategory } from "interfaces/ICategory";

export class CategoryController{
    private _validate: Validate;
    private _serialize: Serialize;
    private _categoryRepository: CategoryRepository;
    
    constructor(){
        this._validate = new Validate();
        this._serialize = new Serialize();
        this._categoryRepository = new CategoryRepository();
    }

    public addRefStoryInCategory = (params: object, story: IStory) => {        
        return this._categoryRepository.findCategories(params)
            .then(categories => {
                categories = categories.map(category => {
                    category.stories.push(story);
                   
                    return category;
                });
                return this._categoryRepository.saveAllCategories(categories);
            })
    }

    public deleteRefStoryInCategory = (params: object, storyId: string) => {
        return this._categoryRepository.findCategories(params)
            .then(categories => {
                categories = categories.map(category => {
                    category.stories = category.stories.filter(id => id.toString() !== storyId);                    
                    return category;
                });
                return this._categoryRepository.saveAllCategories(categories);
            })
    }

    public findCategories = (params: any) => {
        return this._categoryRepository.findCategories(params)
    }

    public getAllCategories = (req: Request, res: Response) => {
        this._categoryRepository.findCategories({})               
                .then(categories => res.send({
                    categories: categories.map(category => this._serialize.getCategory(category)),        
                    //success: constants.message.successfully_added            
                }))
                .catch(e => this._validate.sendError(e, res));
    }
}