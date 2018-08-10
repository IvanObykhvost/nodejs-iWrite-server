import { Request, Response } from "express";
import { UserRepository } from "../repository/userRepository";
import { Validate } from "../utils/validate";
import { Serialize } from "../utils/serialize";
import { Generate } from "../utils/generateToken";
import { constants } from "../constants";
import { IUser } from "interfaces/IUser";
const bcrypt = require('bcrypt-nodejs');
const generate = new Generate();

export class UserController{
    private _userRepository: UserRepository;
    private _validate: Validate;
    private _serialize: Serialize;

    constructor(){
        this._userRepository = new UserRepository();
        this._validate = new Validate();
        this._serialize = new Serialize();
    }

    public getUserByToken = (req: Request, res: Response) => {
        const token = req.headers.authorization;
        const {error} = this._validate.byToken(token);
        if(error) return this._validate.sendError(error, res);

        this._userRepository.findOneUser({token})
            .then(user => {
                res.send(this._serialize.getUser(user))})
            .catch(e => this._validate.sendError(e, res))
    }

    public registerUser = (req: Request, res: Response) => {
        const {error} = this._validate.byRegister(req.body);
        if(error) return this._validate.sendError(error, res);

        this._userRepository.findOneUser({email: req.body.email})
            .then(
                () => Promise.reject(constants.errors.email_already),
                error => {
                    if(error === constants.errors.no_found_user){
                        return this._userRepository.findOneUser({name: req.body.name});
                    }
                    throw error
                }
            )
            .then(
                () => Promise.reject(constants.errors.username_already_use),
                error => {
                    if(error === constants.errors.no_found_user){
                        const user = this._userRepository.createNewModel(req.body);
                        return this._userRepository.saveOneUser(user);
                    }
                    throw error;
                }
            )
            .then(user => res.send({
                    user: this._serialize.getUser(user),
                    success: constants.message.successfully_login
            }))
            .catch(e => this._validate.sendError(e, res))
    }

    public login = (req: Request, res: Response) => {
        const {error} = this._validate.byLogin(req.body);
        if(error) return this._validate.sendError(error, res);

        this._userRepository.findOneUser({email: req.body.email})
            .then(
                user => { 
                    const comparePass: boolean = bcrypt.compareSync(req.body.password, user.password);
                    if(comparePass){
                        user.token = generate.getToken();
                        return this._userRepository.saveOneUser(user);
                    }
                    throw constants.errors.invalid_credentials;
                }
            )
            .then(
                user => res.send({
                    user: this._serialize.getUser(user).user,
                    success: constants.message.successfully_login
                })
            )
            .catch(e => this._validate.sendError(e, res))
    }

    public saveUserSetting = (req: Request, res: Response) => {
        const token = req.headers.authorization;
        const settingsUser = this._serialize.getSettings(<IUser>req.body.user);
        const {error} = this._validate.byUpdateUser(settingsUser);
        if(error) return this._validate.sendError(error, res);

        this._userRepository.findOneUser({email: settingsUser.email})
            .then(
                user => {
                    if(user.token !== token)
                        throw constants.errors.email_already;
                    return this._userRepository.findOneUser({name: settingsUser.name});
                },
                error =>  {
                    if(error === constants.errors.no_found_user)
                        return this._userRepository.findOneUser({name: settingsUser.name});
                    throw error;
                }
            )
            .then(
                user => {
                    if(user.token !== token)
                        throw constants.errors.username_already_use;
                    return this._userRepository.updateOneUser({token}, settingsUser);
                },
                error =>  {
                    if(error === constants.errors.no_found_user)
                        return this._userRepository.updateOneUser({token}, settingsUser);
                    throw error;
                }
            )
            .then(
                user => res.send({
                    user: this._serialize.getUser(user).user,
                    success: constants.message.succesfully_updated_user
                }),
                error =>  {throw error}
            )
            .catch(e => this._validate.sendError(e, res));
    }

    public addNewUser(req: Request, res: Response){

    }

}