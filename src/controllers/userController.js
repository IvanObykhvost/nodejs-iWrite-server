const UserRepository = require('../repository/userRepository');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function UserController(){
    this.getUserByToken = (req, res) => {
        const token = req.headers.authorization;
        let errorToken = validate.byToken(token).error;
        if(errorToken) return this.returnError(ERRORS.INVALID_TOKEN, res);

        this.getOneUserByParams({token})
            .then(
                user => {
                    if(!user || user.details ) 
                        throw ERRORS.INVALID_CREDENTIALS;
                    else
                        res.send(serialize.getUser(user));
                },
                error => {
                    return this.returnError(error, res);
            })
            .catch(e => 
                this.registerUser(e, res)
            )
    },
    this.registerUser = (req, res) => {
        let {error} = validate.byRegister(req.body);
        if(error) return this.returnError(error, res);

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

        this.getOneUserByParams({email: req.body.email, password: req.body.password})
            .then(user => {
                    if (!user){
                        throw ERRORS.INVALID_CREDENTIALS;
                    } else {
                        res.send(serialize.getUser(user));
                    }
                },
                error => {
                    return this.returnError(error, res);
                }
            )
            .catch(e =>
                this.returnError(e, res)
            )
    },
    
    this.saveUser = (req, res) => { 
        const token = req.headers.authorization;
        const user = serialize.getSetting(req.body.user).user;
        let {error} = validate.byUpdateUser(user);
        if(error) return this.returnError(error, res);
        user.updatedAt = new Date();

        UserRepository.findOneAndUpdate(token, user, (error, user) => {
            if(error) 
                throw error;
            if(!user)
                throw ERRORS.NO_FOUND_USER;
        })
        .catch(e => 
            this.returnError(e, res)
        );

        this.getOneUserByParams({token})
            .then(user => {
                res.send(serialize.getUser(user));
            })
            .catch(e => 
                this.returnError(e, res)
            )
    },

    /**
    * Use by look for user
    * @method  getOneUserByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Object} user or error
    */
    this.getOneUserByParams = (findParams) => {
        return UserRepository.findOne(findParams, (error, user) => {
            if(error) return error;
            else return user;
        });
    },
    /**
    * Use by look for many users
    * @method  getUsersByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Array[Objects]} users or error
    */
   this.getUsersByParams = (findParams) => {
    return UserRepository.find(findParams, (error, users) => {
        if(error) return error;
        else return users;
    });
},
    this.returnError = (error, res) => {
        let message = error;
        if(error.details) {
            message = error.details[0].message;
        }
        if(error.message){
            message = error.message;
        }
        return res.send(serialize.error(message));
    }
}

module.exports = new UserController;
