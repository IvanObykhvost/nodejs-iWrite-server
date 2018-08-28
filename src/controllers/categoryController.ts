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
        this._categoryRepository.findCategories([{}])               
                .then(categories => res.send({
                    categories: categories.map(category => this._serialize.getCategory(category)),        
                    //success: constants.message.successfully_added            
                }))
                .catch(e => this._validate.sendError(e, res));
    }


    //retrieves category ids by categoy names
    /*public findCategories = (categories: number[]) => {
        this._categoryRepository.findCategories(categories)
            .then(categories =>{
                const result = ca.map(tag => {
                    return tag.text
                });
                res.send(result);
            })
            .catch(e => this._validate.sendError(e, res))
    }*/

    /*public saveTagsByPostId = (tags: string[], post: IPost) => {
        
        let ids: ITag[] = [];

        return this._tagRepository.findTags({posts: post.id})
            .then(
                resultTags => {
                    resultTags = resultTags.map(tag => {
                        tag.posts = tag.posts.filter(el => el.toString() !== post.id.toString());
                        tag.popular = tag.posts.length;
                        return tag;
                    });
                    return this._tagRepository.saveAllTags(resultTags);
                },
                error => {
                    if(error === constants.errors.no_found_tag)
                        return tags;
                    throw error;
                }
            )
            .then(() => this._tagRepository.findTags({text: {$in: tags}}))
            .then(
                resultTags =>{
                    let text: Array<string> = [];
                    resultTags = resultTags.map(tag => {
                        ids.push(tag);
                        text.push(tag.text);
                        tag.posts.push(post._id);
                        tag.popular = tag.posts.length;
                        return tag;
                    });
                    tags = tags.filter(tag => !text.includes(tag));
                    return this._tagRepository.saveAllTags(resultTags);
                },
                error => {
                    if(error === constants.errors.no_found_tag){
                        return tags;
                    }
                    throw error;
                }
            )
            .then(() => {
                    const newTags = tags.map(tag => 
                        this._tagRepository.createNewTag({
                            text: tag,
                            posts: post._id
                        })
                    );
                    return this._tagRepository.insertAllTags(newTags);
            })
            .then(
                resultTags => {
                    resultTags.map(tag => ids.push(tag))
                    return ids;
                }, 
                error => {
                    if(error === constants.errors.no_found_tag)
                        return ids;
                    throw error;
                }
            )
    }

    public deleteRefPostInTag = (params: object, postId: string) => {
        return this._tagRepository.findTags(params)
            .then(tags => {
                tags = tags.map(tag => {
                    tag.posts = tag.posts.filter(el => el.toString() !== postId);
                    tag.popular = tag.posts.length;
                    return tag;
                });
                return this._tagRepository.saveAllTags(tags);
            })
    }*/
}