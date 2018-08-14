import { Request, Response } from "express";
import { Validate } from "../utils/validate";
import { Serialize } from "../utils/serialize";
import { constants } from "../constants";
import { TagRepository } from "../repository/tagRepository";
import { IPost } from "interfaces/IPost";
import { ITag } from "interfaces/ITag";

export class TagController{
    private _validate: Validate;
    private _serialize: Serialize;
    private _tagRepository: TagRepository;
    
    constructor(){
        this._validate = new Validate();
        this._serialize = new Serialize();
        this._tagRepository = new TagRepository();
    }

    public getPopularTags = (req: Request, res: Response) => {
        this._tagRepository.getPopularTags()
            .then(tags =>{
                const result = tags.map(tag => {
                    return tag.text
                });
                res.send(result);
            })
            .catch(e => this._validate.sendError(e, res))
    }

    public saveTagsByPostId = (tags: string[], post: IPost) => {
        
        let ids: ITag[] = [];

        return this._tagRepository.findTags({posts: post.id})
            .then(
                resultTags => {
                    resultTags = resultTags.map(tag => {
                        tag.popular--;
                        tag.posts = tag.posts.filter(el => el.toString() !== post.id.toString());
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
                        tag.popular++;
                        ids.push(tag);
                        text.push(tag.text);
                        tag.posts.push(post._id);
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
                    tag.popular--;
                    tag.posts = tag.posts.filter(el => el.toString() !== postId)
                    return tag;
                });
                return this._tagRepository.saveAllTags(tags);
            })
    }
}