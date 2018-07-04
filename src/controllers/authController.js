const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function AuthController(){
    this.authentication = (req, res, next) => {
        const token = req.headers.authorization;
        let {error} = validate.byToken(token);
        if(error) return this.returnError(ERRORS.INVALID_TOKEN, res);
        next();
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


module.exports = new AuthController;