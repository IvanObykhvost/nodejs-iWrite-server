const UserRepository = require('../repository/userRepository');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function UserController(){
    this.getUserByToken = (req, res) => {
        const token = req.headers.authorization;
        let {error} = validate.byToken(token);
        if(error) return this.returnError(ERRORS.INVALID_TOKEN, res);

        UserRepository.getOneUserByParams({token})
            .then(
                user => res.send(serialize.getUser(user)),
                error =>  this.returnError(error, res)
            )
            .catch(e => 
                this.returnError(e, res)
            )
    },
    this.registerUser = (req, res) => {
        let {error} = validate.byRegister(req.body);
        if(error) return this.returnError(error, res);

        UserRepository.getUsersByParams({ $or: [ {email: req.body.email}, {name: req.body.name}]})
            .then(
                () => { throw ERRORS.EMAIL_ALREADY },
                error => {
                    if(error === ERRORS.NO_FOUND_USER){
                        let user = new UserRepository(req.body);
                        return user.save();
                    }
                    throw error;
                }
            )
            .then(user => {
                    if(user.errors) throw user.errors;
                    res.send(serialize.getUser(user))
            })
            .catch(e => 
                this.returnError(e, res)
            )
    },
    this.loginUser = (req, res) => { 
        let {error} = validate.byLogin(req.body, res);
        if(error) return this.returnError(error, res);

        UserRepository.getOneUserByParams({email: req.body.email, password: req.body.password})
            .then(
                user => res.send(serialize.getUser(user)),
                error =>  this.returnError(error, res)
            )
            .catch(e =>
                this.returnError(e, res)
            )
    },
    
    this.saveUser = (req, res) => { 
        const token = req.headers.authorization;
        const {user} = serialize.getSetting(req.body.user);
        let {error} = validate.byUpdateUser(user);
        if(error) return this.returnError(error, res);
        user.updatedAt = new Date();

        UserRepository.updateOneUser({token}, user)
            .then(
                user => res.send(serialize.getUser(user)),
                error =>  this.returnError(error, res)
            )
            .catch(e => 
                this.returnError(e, res)
            );
    },

    /**
    * Use by look for user
    * @method  getOneUserByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Object} user or error
    */
    this.getOneUserByParams = (findParams) => {
        return UserRepository.findOne(findParams)
            .then(user => {
                if(!user) return Promise.reject(ERRORS.NO_FOUND_USER)
                if(user.errors) return Promise.reject(error);
                return user
            });
    },
    /**
    * Use by look for many users
    * @method  getUsersByParams
    * @param {Object} findParams object by find {name : 'Jack'}.
    * @returns {Array[Objects]} users or error
    */
   this.getUsersByParams = (findParams) => {
    return UserRepository.find(findParams)
        .then(users => {
            if(users.length === 0) return Promise.reject(ERRORS.NO_FOUND_USER)
            if(users.errors) return Promise.reject(error);
            return users
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
