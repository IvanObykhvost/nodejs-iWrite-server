const UserRepository = require('../repository/userRepository');
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function AuthController(){
    this.authentication = (req, res, next) => {
        const token = req.headers.authorization;
        let {error} = validate.byToken(token);
        if(error) return validate.sendError(error, res);

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