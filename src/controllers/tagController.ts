import { Request, Response } from "express";
import { Validate } from "../utils/validate";
import { Serialize } from "../utils/serialize";
import { constants } from "../constants";
import { TagRepository } from "repository/tagRepository";

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

    public saveTagsByPostId = (tags: string[], postId: string) => {
        let ids: string[];

        return this._tagRepository.findTags({posts: postId})
            .then(
                resultTags => {
                    resultTags = resultTags.map(tag => {
                        tag.popular--;
                        tag.posts = tag.posts.filter(el => el.id !== postId);
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
                    let text: Array<string>;
                    resultTags = resultTags.map(tag => {
                        tag.popular++;
                        ids.push(tag.id);
                        text.push(tag.text);
                        // tag.posts.push(postId);
                        return tag;
                    });
                    tags = tags.filter(tag => !text.includes(tag));
                    return this._tagRepository.saveAllTags(resultTags);
                },
                error => {
                    if(error === constants.errors.no_found_tag)
                        return tags;
                    throw error;
                }
            )
            .then(() => {
                const newTags = tags.map(tag => 
                    this._tagRepository.createNewTag({
                        text: tag,
                        post: postId
                    })
                );
                return this._tagRepository.saveAllTags(newTags);
            })
            .then(resultTags => {
                resultTags.map(tag => ids.push(tag.id))
                return ids;
            })
    }

    public deleteRefPostInTag = (params: object, postId: string) => {
        return this._tagRepository.findTags(params)
            .then(tags => {
                tags = tags.map(tag => {
                    tag.popular--;
                    tag.posts = tag.posts.filter(el => el.id !== postId )
                    return tag;
                })
            })
    }
}