import { Request, Response, NextFunction } from "express";
import { Validate } from "../utils/validate";
import { UserRepository } from "../repository/userRepository";

export class AuthController{
    private _validate: Validate;
    private _userRepository: UserRepository;
    
    constructor(){
        this._validate = new Validate();
        this._userRepository = new UserRepository();
    }

    public authentication = (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;
        const {error} = this._validate.byToken(token);
        if(error) return this._validate.sendError(error, res);

        this._userRepository.findOneUser({token})
            .then(user => {
                    req.body.currentUser = user;
                    next();
            })
            .catch(e => this._validate.sendError(e, res));

    }
}