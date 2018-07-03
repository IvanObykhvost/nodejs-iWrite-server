const UserController = require('../controllers/userController');
const ERRORS = require('../constants').ERRORS;
const validate = require('../utils/validate').Validate;
const serialize = require('../utils/serialize').Serialize;

function ProfileController(){
    this.getProfile = (req, res) => {
        const name = req.params.username;
        let error = validate.byUsername({name}).error;
        if(error) return this.returnError(error, res);

        UserController.getUserByParams({name})
            .then(
                user => {
                    if(!user) //что-то не работает
                        throw ERRORS.NO_FOUND_USER;
                    else
                        res.send(serialize.getProfile(user));
                },
                error => {
                    return this.returnError(error, res);
                }
            )
            .catch(error =>
                this.returnError(error, res)
            )
    },
    this.returnError = (error, res) => {
        let message = error;
        if(error.details) {
            message = error.details[0].message;
        }
        return res.send(serialize.error(message));
    }
}

module.exports = new ProfileController;