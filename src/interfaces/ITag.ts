import { Document } from "mongoose";
import { IPost } from "./IPost";

export interface ITag extends Document{
    id: string;
    text: string;
    popular: number;
    posts: Array<IPost>
}
