const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;
const ERRORS = require('../constants').ERRORS;

function AuthController(){
    this.authentication = (req, res, next) => {
        const token = req.headers.authorization;
        let {error} = validate.byToken(token);
        if(error) return validate.returnError(ERRORS.INVALID_TOKEN, res);
        next();
    }
}


module.exports = new AuthController;