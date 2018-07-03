const UserRepository = require('../repository/userRepository');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function UserController(){
    this.getUserByToken = (req, res) => {
        const token = req.headers.authorization;
        let errorToken = validate.byToken(token).error;
        if(errorToken) return this.returnError(ERRORS.INVALID_TOKEN, res);

        this.getUserByParams({token})
            .then(
                user => {
                    if(!user || user.details ) 
                        return this.returnError(ERRORS.INVALID_CREDENTIALS, res);
                    else
                        res.send(serialize.getUser(user));
                },
                error => {
                    return this.returnError(error, res);
            })
    },
    this.registerUser = (req, res) => {
        let {error} = validate.byRegister(req.body);
        if(error) return this.returnError(error, res);

        // this.getUserByParams({...req.body.email, ...req.body.name})
        //     .then(user => {
        //         if(!user || user.details ) 
        //             this.returnError(ERRORS.INVALID_CREDENTIALS, res);
        //         else
        //             res.send(serialize.getUser(user));
        //     })

        UserRepository.find({ email: req.body.email}, (error, user) => {
            if(error) res.send(serialize.error(error));

            if(user.length === 0) {
                let user = new UserRepository(req.body);
                user.save(error => {
                    if(error) 
                        return this.returnError(error, res);
                    else
                        res.send(serialize.getUser(user));
                });
            } else {
                return this.returnError(ERRORS.EMAIL_ALREADY, res);
            }
        });
    },
    this.loginUser = (req, res) => { 
        let {error} = validate.byLogin(req.body, res);
        if(error) return this.returnError(error, res);

        this.getUserByParams({email: req.body.email, password: req.body.password})
            .then(
                user => {
                    if (!user){
                        this.returnError(ERRORS.INVALID_CREDENTIALS, res);
                    } else {
                        res.send(serialize.getUser(user));
                    }
                },
                error => {
                    return this.returnError(error, res);
                }
            )
        // UserRepository.findOne({ email: req.body.email, password: req.body.password}, (error, user) => {
        //     if(error){
        //         this.returnError(error, res);
        //     } 
        //     if (!user){
        //         this.returnError(ERRORS.NO_FOUND_USER, res);
        //     } else {
        //         res.send(serialize.getUser(user));
        //     }
        // });
    },
    
    this.saveUser = (req, res) => { 
        let {error} = validate.byLogin(req.body, res);
        if(error) return this.returnError(error, res);

        // UserRepository.findOneAndUpdate(token, set, (error, user) => {
        //     if(error || !user) 
        //         res.status(404).send(serialize.error(ERRORS.NO_FOUND_USER));
        //     else
        //         res.send(serialize.getUser(user));
        // });
    },

    /**
    * Use by look for user
    * @method  getUserByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Object} user or error
    */
    this.getUserByParams = (findParams) => {
        return UserRepository.findOne(findParams, (error, user) => {
            if(error) return error;
            else return user;
        });
    },
    this.returnError = (error, res) => {
        let message = error;
        if(error.details) {
            message = error.details[0].message;
        }
        return res.send(serialize.error(message));
    }
}

module.exports = new UserController;
