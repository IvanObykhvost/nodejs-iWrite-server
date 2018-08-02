const UserRepository = require('../repository/userRepository');
const constants = require('../constants');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;
const generate = require('../utils/genarateToken').Generate;
const bcrypt = require('bcrypt-nodejs');

class UserController {
    constructor(){

    }

    getUserByToken(req, res){
        const token = req.headers.authorization;
        const {error} = validate.byToken(token);
        if(error) return validate.sendError(constants.ERRORS.INVALID_TOKEN, res);

        UserRepository.getOneUserByParams({token})
            .then(
                user => res.send(serialize.getUser(user)),
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }

    registerUser(req, res) {
        const {error} = validate.byRegister(req.body);
        if(error) return validate.sendError(error, res);

        UserRepository.getOneUserByParams({email: req.body.email})
            .then(
                () => { throw constants.ERRORS.EMAIL_ALREADY },
                error => {
                    if(error === constants.ERRORS.NO_FOUND_USER){
                        return UserRepository.getOneUserByParams({name: req.body.name});
                    }
                    throw error;
                }
            )
            .then(
                () => { throw constants.ERRORS.USERNAME_ALREADY_USE },
                error => {
                    if(error === constants.ERRORS.NO_FOUND_USER){
                        let user = new UserRepository(req.body);
                        user.password = bcrypt.hashSync(user.password);
                        return UserRepository.saveOneUser(user);
                    }
                    throw error;
                }
            )
            .then(
                user => res.send({
                    user: serialize.getUser(user).user,
                    success: serialize.success(constants.MESSAGE.SUCCESSFULLY_LOGIN).success
                }),
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }

    loginUser(req, res) { 
        const {error} = validate.byLogin(req.body, res);
        if(error) return validate.sendError(error, res);

        UserRepository.getOneUserByParams({email: req.body.email})
            .then(
                user => {
                    let comparePass = bcrypt.compareSync(req.body.password, user.password);
                    if(comparePass){
                        user.token = generate.token();
                        return UserRepository.saveOneUser(user);
                    }
                    else {
                        throw constants.ERRORS.INVALID_CREDENTIALS;
                    }
                },
                error => {throw error}
            )
            .then(
                user => res.send({
                    user: serialize.getUser(user).user,
                    success: serialize.success(constants.MESSAGE.SUCCESSFULLY_LOGIN).success
                }),
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }
    
    saveUserSettings(req, res) { 
        const token = req.headers.authorization;
        const settingsUser = serialize.getSetting(req.body.user);
        const {error} = validate.byUpdateUser(settingsUser);
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
                user => res.send({
                    user: serialize.getUser(user).user,
                    success: serialize.success(constants.MESSAGE.SUCCESFULLY_UPDATED_USER).success
                }),
                error =>  {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }


    removeFavoriteFromUsers(findParams){
        return UserRepository.getUsersByParams(findParams)
            .then(
                users => {
                    users = users.map(user => {
                        user.favorites.pull(findParams.favorites);
                        return user;
                    });
                    return UserRepository.saveAllUsers(users, users.length);
                },
                error => {
                    if(error === constants.ERRORS.NO_FOUND_USER)
                        return constants.MESSAGE.SUCCESSFULLY_REMOVED_FAVORITE 
                    throw error
                }
            )
            .then(message => message)
            .catch(e => Promise.reject(e))
    }
}

module.exports = new UserController();
