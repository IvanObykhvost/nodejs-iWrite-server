const UserRepository = require('../repository/userRepository');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function AuthController(){
    this.authentication = (req, res, next) => {
        const token = {token: req.headers.authorization};
        let {error} = validate.byToken(token);
        if(error) return this.returnError(error, res);
        next();
    },
    this.returnError = (error, res) => {
        let message = error;
        if(error.details[0]) {
            message = error.details[0].message;
        }
        return res.send(serialize.error(message));
    }
}


module.exports = new AuthController;