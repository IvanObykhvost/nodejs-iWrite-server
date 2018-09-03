import { Request, Response } from "express";
import { Validate } from "../utils/validate";
import { Serialize } from "../utils/serialize";
import { UserRepository } from "../repository/userRepository";
import { constants } from "../constants";
import { IUser } from "interfaces/IUser";

export class ProfileController{
    private _validate: Validate;
    private _serialize: Serialize;
    private _userRepository: UserRepository;
    
    constructor(){
        this._validate = new Validate();
        this._serialize = new Serialize();
        this._userRepository = new UserRepository();
    }

    public getProfile = (req: Request, res: Response) => {
        const name = req.params.username;
        const {error} = this._validate.byUsername({name});
        if(error) return this._validate.sendError(error, res);

        const token = req.headers.authorization;
        let currentUser: IUser;

        if(token === "null")
            return this.getProfileWithoutToken(name, res);

        this._userRepository.findOneUser({name})
            .then(user =>{
                currentUser = user;
                return this._userRepository.getOneFollowingFlag(token, currentUser.id);
            })
            .then(following => {
                currentUser.following = following;
                res.send(this._serialize.getProfile(currentUser));
            })
            .catch(e => this._validate.sendError(e, res))
    }

    private getProfileWithoutToken = (name: string, res: Response) => {
        this._userRepository.findOneUser({name})
            .then(user => res.send(this._serialize.getProfile(user)))
            .catch(e => this._validate.sendError(e, res))
    }

    public follow = (req: Request, res: Response) => {
        this.addOrDeleteFollow(req, res, constants.operation.add_follower);
    }

    public unfollow = (req: Request, res: Response) => {
        this.addOrDeleteFollow(req, res, constants.operation.delete_follower);
    } 

    private addOrDeleteFollow = (req: Request, res: Response, action: string) => {
        const token = req.headers.authorization;
        const name = req.params.username;
        const {error} = this._validate.byUsername({name});
        if(error) return this._validate.sendError(error, res);

        this._userRepository.findUsers({ $or: [{token}, {name}]})
            .then(users => {
                if(users.length < 2) throw constants.errors.no_found_user;

                let sortUsers = this.sortByToken(users, token);
                if(action === constants.operation.add_follower){
                    sortUsers[0].followings.push(sortUsers[1]);
                    sortUsers[1].followers.push(sortUsers[0]);
                }
                else{
                    sortUsers[0].followings = sortUsers[0].followings.filter(el => 
                        el.toString() !== sortUsers[1].id.toString()
                    );
                    sortUsers[1].followers = sortUsers[1].followers.filter(el => 
                        el.toString() !== sortUsers[0].id.toString()
                    );
                }
                return this._userRepository.saveAllusers(sortUsers);
            })
            .then(() => res.send(constants.message.successfully_signed))
            .catch(e => this._validate.sendError(e, res));
    }

    private sortByToken = (users: IUser[], token: string | undefined) => {
        if(users[0].token === token){
            return users;
        }
        else{
            let temp = users[0];
            users[0] = users[1];
            users[1] = temp;
            return users;
        }
    }

    public getFollowers = (req: Request, res: Response) => {
        const name = req.params.username;
        const {error} = this._validate.byUsername({name});
        if(error) return this._validate.sendError(error, res);

        const aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };

        this._userRepository.findOneUser({name})
            .then(
                user => {
                    if(user.followers.length === 0) throw constants.errors.no_found_followers;

                    let count = user.followers.length;
                    user.followers = user.followers.slice(
                        Number(aggregate.offset), Number(aggregate.offset)+Number(aggregate.limit)
                    );
                    user.followers = user.followers.map(follower => {
                        follower.following = user.followings.some(el => el.id === follower.id);
                        return follower;
                    });
                    res.send({
                        followers: user.followers.map(user => this._serialize.getFollower(user)),
                        count
                    })
            })
            .catch(e => this._validate.sendError(e, res));
    }

    public getFollowing = (req: Request, res: Response) => {
        const name = req.params.username;
        const {error} = this._validate.byUsername({name});
        if(error) return this._validate.sendError(error, res);

        const aggregate = {
            limit: req.query.limit, 
            offset: req.query.offset
        };

        this._userRepository.findOneUser({name})
            .then(
                user => {
                    if(user.followings.length === 0) throw constants.errors.no_found_followings;

                    let count = user.followings.length;
                    user.followings = user.followings.slice(
                        Number(aggregate.offset), Number(aggregate.offset)+Number(aggregate.limit)
                    );
                    user.followings = user.followings.map(follower => {
                        follower.following = true;
                        return follower;
                    });
                    res.send({
                        followers: user.followings.map(user => this._serialize.getFollower(user)),
                        count
                    })
            })
            .catch(e => this._validate.sendError(e, res));
    }
}