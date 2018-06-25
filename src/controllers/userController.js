const UserRepository = require('../repository/userRepository');
const ERRORS = require('../constants');
const validate = require('../utils/validate').Validate;


function UserController(){
    let serialize = new Serialize();
    this.getUserByToken = (req, res) => {
        const token = {token :req.headers.authorization};
        let {error} = validate.byToken(token);
        if(error) return this.returnError(error, res);

        UserRepository.findOne(token, (error, user) => {
            if(error || !user) 
                this.error(ERRORS.NO_FOUND_USER, res);
            else
                res.send(serialize.getUser(user));
        });
    },
    this.registerUser = (req, res) => {
        let {error} = validate.byRegister(req.body, res);
        if(error) return this.returnError(error, res);

        UserRepository.find({ email: req.body.email}, (error, user) => {
            if(error) res.send(serialize.error(error));

            if(user.length === 0) {
                let user = new UserRepository(req.body);
                user.save(error => {
                    if(error) 
                        this.error(error, res);
                    else
                        res.send(serialize.getUser(user));
                });
            } else {
                this.error(ERRORS.EMAIL_ALREADY, res);
            }
        });
    },
    this.loginUser = (req, res) => { 
        let {error} = validate.byLogin(req.body, res);
        if(error) return this.returnError(error, res);

        UserRepository.findOne({ email: req.body.email, password: req.body.password}, (error, user) => {
            if(error){
                this.error(error, res);
            } 
            if (!user){
                this.error(ERRORS.NO_FOUND_USER, res);
            } else {
                res.send(serialize.getUser(user));
            }
        });
    },
    this.saveUser = (req, res) => { 
        let {error} = validate.byLogin(req.body, res);
        if(error) return this.returnError(error, res);

        // UserRepository.findOneAndUpdate(token, set, (error, user) => {
        //     if(error || !user) 
        //         res.status(404).send(serialize.error(ERRORS.NO_FOUND_USER));
        //     else
        //         res.send(serialize.getUser(user));
        // });
    },
    this.returnError = (error, res) => {
        let message = error;
        if(error.details[0]) {
            message = error.details[0].message;
        }
        return res.send(serialize.error(message));
    }
}

function Serialize(){
    this.getUser = (user) => {
        return { 
            user: {
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                bio: user.bio,
                image: user.image,
                token:  user.token
            }
        };
    },
    this.error = (error) => {
        return {
            error
        }
    }
}

module.exports = new UserController;
