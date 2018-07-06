const USERS = "users";

const COLLECTIONS = {
    USERS
};

const NO_FOUND_USER = "No found user";
const NO_FOUND_POST = "No found posts";
const NO_FOUND_FAVORITE = "No found favorite";
const NO_FOUND_FOLLOW = "No found follow";
const INVALID_CREDENTIALS = "Invalid email or password";
const EMAIL_ALREADY = "Sorry, such email is already registered.";
const NO_POSTS_YET = "No posts yet...";
const INVALID_TOKEN = "Invalid token";
const NO_POST_OWNER ='post not owner this user';

const ERRORS = {
    NO_FOUND_USER,
    NO_FOUND_POST,
    NO_FOUND_FAVORITE,
    NO_FOUND_FOLLOW,
    NO_POST_OWNER,
    EMAIL_ALREADY,
    INVALID_CREDENTIALS,
    INVALID_TOKEN
};

const SUCCESSFULLY_SIGNED = 'Successfully signed';
const SUCCESSFULLY_REMOVED_SUBSCRIPTION = 'Successfully removed subscription';
const SUCCESSFULLY_ADDED = 'Successfully added';
const SUCCESFULLY_UPDATED_POST = 'Succesfully updated post';
const SUCCESSFULLY_REMOVED_FAVORITE = 'Successfully removed favorite';

const MESSAGE = {
    SUCCESSFULLY_SIGNED,
    SUCCESSFULLY_REMOVED_SUBSCRIPTION,
    SUCCESSFULLY_ADDED,
    NO_POSTS_YET,
    SUCCESFULLY_UPDATED_POST,
    SUCCESSFULLY_REMOVED_FAVORITE
}

const ADD_FOLLOW = "ADD_FOLLOW";
const DELETE_FOLLOW = "DELETE_FOLLOW";

const OPERATION = {
    ADD_FOLLOW,
    DELETE_FOLLOW
}

module.exports.COLLECTIONS = COLLECTIONS;
module.exports.ERRORS = ERRORS;
module.exports.MESSAGE = MESSAGE;
module.exports.OPERATION = OPERATION;
