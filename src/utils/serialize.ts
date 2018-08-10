import { IUser } from "../interfaces/IUser";
import { IComment } from "interfaces/IComment";

export class Serialize{

    public getUser(user: IUser){
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

    public getSettings(user: IUser){
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