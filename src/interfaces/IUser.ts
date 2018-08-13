import { Document } from "mongoose";

export interface IUser extends Document{
    id: string;
    name: string;
    email: string;
    password: string;
    bio: string;
    image: string;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    following: boolean;
    followings: Array<IUser>;
    followers: Array<IUser>;
    favorites: Array<IUser>;
}