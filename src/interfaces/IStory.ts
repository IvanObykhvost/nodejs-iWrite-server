import { Document } from "mongoose";
import { IUser } from "./IUser";
import { IComment } from "./IComment";
import { ICategory } from "./ICategory";

export interface IStory extends Document{
    id: string;   
    title: string,

    shortDescription: string,
    longDescription: string,
    disableComments: boolean,
    disableRatings: boolean,
    status: string,
    
    favorited: boolean;
    favouritesCount: number;
    createdAt: Date;
    updatedAt: Date;

    favorites: Array<IUser>;
    author: IUser;
    categories: Array<ICategory>;
    comments: Array<IComment>;
}