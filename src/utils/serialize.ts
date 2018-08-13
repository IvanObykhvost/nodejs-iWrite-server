import { IUser } from "../interfaces/IUser";
import { IComment } from "interfaces/IComment";
import { IPost } from "interfaces/IPost";

export class Serialize{

    public getUser = (user: IUser) => {
        return {
            user: {
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                bio: user.bio,
                image: user.image,
                token:  user.token
            }
        }
    }

    public getSettings = (user: IUser) =>{
        return {
            name: user.name,
            email: user.email,
            bio: user.bio,
            image: user.image
        }
    }

    public getComment = (comment: IComment) => {
        return {
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            author: this.getAuthor(comment.author)
        }
    }

    public getProfile = (user: IUser) => {
        return {
            user: {
                name: user.name,
                email: user.email,
                bio: user.bio,
                image: user.image,
                following: user.following
            }
        }
    }

    public getFollower = (user: IUser) => {
        return {
            name: user.name,
            bio: user.bio,
            image: user.image,
            following: user.following,
            followers: user.followers.length,
            favorites: user.favorites.length
        }
    }

    public getPost = (post: IPost) => {
        return {
            id: post.id,
            title: post.title,
            topic: post.topic,
            message: post.message,
            tags: post.tags.map(tag => tag.text),
            favorited: post.favorited,
            favouritesCount: post.favouritesCount,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: this.getAuthor(post.author)
        }
    }

    public setUpdatePost = (post: any) =>{
        return {
            id: post.id,
            title: post.title,
            topic: post.topic,
            message: post.message,
            tags: post.tags,
        }
    }

    public getCurrentUserFromBody = (body: any) => {
        let currentUser: IUser = body.currentUser;
        delete body.currentUser;
        return {body, currentUser};
    }
    
    public sendPosts = (posts: IPost[], count: number) => {
        return {
            posts: posts.map(post => this.getPost(post)),
            count
        }
    }

    public success(message: string){
        return {
            success: message
        }
    }

    public error(message: string){
        return {
            error: message
        }
    }

    private getAuthor = (author: IUser) => {
        return {
            name: author.name,
            image: author.image
        }
    }
}