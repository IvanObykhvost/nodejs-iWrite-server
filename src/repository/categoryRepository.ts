import { Model, Document } from "mongoose";
//import TagModel from "../models/Tag";
import CategoryModel from "../models/Category";
import { constants } from "../constants";
import { ICategory } from "interfaces/ICategory";

export class CategoryRepository{
    private _model: Model<Document>;

    constructor(){
        this._model = CategoryModel;
    }

    public findCategories = (params: object) => {
        return this._model.find({"$or": params})
            .then(
                this.returnCategories,
                this.catchError
            )
    }

    public saveOneCategory = (category: any) => {
        return (category as Document).save()
            .then(
                this.returnOneCategory,
                this.catchError
            )
    }

    public saveAllCategories = (categories: ICategory[]): any => {
        if(categories.length === 0){
            return categories.length;
        }
        const category = categories.pop();
        return this.saveOneCategory(category)
            .then(() => this.saveAllCategories(categories))            
    } 

    private returnOneCategory = (category: Document | null) => {
        if(!category) return Promise.reject(constants.errors.no_found_tag);
        return Promise.resolve(<ICategory>category);
    }

    private returnCategories = (categories: Document[]) => {
        if(categories.length === 0) return Promise.reject(constants.errors.no_found_tag);
        return Promise.resolve(categories as Array<ICategory>);
    }

    private catchError = (error: any) => Promise.reject(error)

}