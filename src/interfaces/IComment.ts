import { Document } from "mongoose";
import { IUser } from "./IUser";

export interface IComment extends Document{
    id: string;
    text: string;
    createdAt: Date;
    author: IUser
}
