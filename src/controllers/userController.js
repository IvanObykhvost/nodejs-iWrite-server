const UserRepository = require('../repository/userRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;
const generate = require('../utils/genarateToken').Generate;

function UserController(){
    this.getUserByToken = (req, res) => {
        const token = req.headers.authorization;
        let {error} = validate.byToken(token);
        if(error) return validate.sendError(constants.ERRORS.INVALID_TOKEN, res);

        UserRepository.getOneUserByParams({token})
            .then(
                user => res.send(serialize.getUser(user)),
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res));
    },
    this.registerUser = (req, res) => {
        let {error} = validate.byRegister(req.body);
        if(error) return validate.sendError(error, res);

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
            .catch(e => validate.sendError(e, res));
    },
    this.loginUser = (req, res) => { 
        let {error} = validate.byLogin(req.body, res);
        if(error) return validate.sendError(error, res);

        UserRepository.getOneUserByParams({email: req.body.email, password: req.body.password})
            .then(
                user => {
                    user.token = generate.token();
                    return UserRepository.saveOneUser(user);
                },
                error => {throw error}
            )
            .then(
                user => res.send(serialize.getUser(user)),
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res));
    },
    this.saveUser = (req, res) => { 
        const token = req.headers.authorization;
        const settingsUser = serialize.getSetting(req.body.user).user;
        let {error} = validate.byUpdateUser(settingsUser);
        if(error) return validate.sendError(error, res);

        UserRepository.getOneUserByParams({email: settingsUser.email})
            .then(
                user => {
                    if(user.token !== token)
                        throw constants.ERRORS.EMAIL_ALREADY;
                    return UserRepository.getOneUserByParams({name: settingsUser.name});
                },
                error =>  {
                    if(error === constants.ERRORS.NO_FOUND_USER)
                        return UserRepository.getOneUserByParams({name: settingsUser.name});
                    throw error;
                }
            )
            .then(
                user => {
                    if(user.token !== token)
                        throw constants.ERRORS.USERNAME_ALREADY_USE;
                    return UserRepository.updateOneUser({token}, settingsUser);
                },
                error =>  {
                    if(error === constants.ERRORS.NO_FOUND_USER)
                        return UserRepository.updateOneUser({token}, settingsUser);
                    throw error;
                }
            )
            .then(
                user => res.send(serialize.getUser(user)),
                error =>  {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }
}

module.exports = new UserController;
