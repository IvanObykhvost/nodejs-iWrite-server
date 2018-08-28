import { Document } from "mongoose";
import { IStory } from "./IStory";

export interface ICategory extends Document{
    id: string;
    text: string;
    stories: Array<IStory>
}
