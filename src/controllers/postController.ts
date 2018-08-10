import { Request, Response } from "express";
import { PostRepository } from "../repository/postRepository";

export class PostController{
    private _postRepository: PostRepository;

    constructor(){
        this._postRepository = new PostRepository();
    }

    public getAllPosts(req: Request, res: Response){
        
    }

    public getOnePost(req: Request, res: Response){
        
    }

    public addNewPost(req: Request, res: Response){

    }

    public deletePost(req: Request, res: Response){

    }
}