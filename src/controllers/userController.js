const UserRepository = require('../repository/userRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function UserController(){
    this.getUserByToken = (req, res) => {
        const token = req.headers.authorization;
        let {error} = validate.byToken(token);
        if(error) return validate.returnError(constants.ERRORS.INVALID_TOKEN, res);

        UserRepository.getOneUserByParams({token})
            .then(
                user => res.send(serialize.getUser(user)),
                error => {throw error}
            )
            .catch(e => validate.returnError(e, res));
    },
    this.registerUser = (req, res) => {
        let {error} = validate.byRegister(req.body);
        if(error) return validate.returnError(error, res);

        UserRepository.getUsersByParams({ $or: [{email: req.body.email}, {name: req.body.name}]})
            .then(
                () => { throw constants.ERRORS.EMAIL_ALREADY },
                error => {
                    if(error === constants.ERRORS.NO_FOUND_USER){
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
            .catch(e => validate.returnError(e, res));
    },
    this.loginUser = (req, res) => { 
        let {error} = validate.byLogin(req.body, res);
        if(error) return validate.returnError(error, res);

        UserRepository.getOneUserByParams({email: req.body.email, password: req.body.password})
            .then(
                user => res.send(serialize.getUser(user)),
                error => {throw error}
            )
            .catch(e => validate.returnError(e, res));
    },
    this.saveUser = (req, res) => { 
        const token = req.headers.authorization;
        const {user} = serialize.getSetting(req.body.user);
        let {error} = validate.byUpdateUser(user);
        if(error) return validate.returnError(error, res);

        UserRepository.updateOneUser({token}, user)
            .then(
                user => res.send(serialize.getUser(user)),
                error =>  {throw error}
            )
            .catch(e => validate.returnError(e, res));
    }
}

module.exports = new UserController;
