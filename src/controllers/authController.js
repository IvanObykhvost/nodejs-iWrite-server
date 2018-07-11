const UserRepository = require('../repository/userRepository');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;
const ERRORS = require('../constants').ERRORS;

function AuthController(){
    this.authentication = (req, res, next) => {
        const token = req.headers.authorization;
        let {error} = validate.byToken(token);
        if(error) return validate.sendError(ERRORS.INVALID_TOKEN, res);

        UserRepository.getOneUserByParams({token})
            .then(
                user => {
                    req.body.currentUser = serialize.getCurrentUser(user);
                    next();
                },
                error => {throw error}
            )
            .catch(e => validate.sendError(e, res));
    }
}


module.exports = new AuthController;