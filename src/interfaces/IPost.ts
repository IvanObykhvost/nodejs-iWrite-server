import { Document } from "mongoose";
import { IUser } from "./IUser";
import { IComment } from "./IComment";
import { ITag } from "./ITag";

export interface IPost extends Document{
    id?: string;
    title: string;
    topic: string;
    message: string;
    favorited: boolean;
    favouritesCount: number;
    createdAt: Date;
    updatedAt: Date;

    favorites: Array<IUser>;
    author: IUser;
    tags: Array<ITag>;
    comments: Array<IComment>;
}