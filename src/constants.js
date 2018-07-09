const USERS = "users";
const POSTS = "posts";

const COLLECTIONS = {
    USERS,
    POSTS
};

const NO_FOUND_USER = "No found user";
const NO_FOUND_POST = "No found posts";
const NO_FOUND_FAVORITE = "No found favorite";
const NO_FOUND_FOLLOWS = "No found follows user";
const INVALID_CREDENTIALS = "Invalid email or password";
const EMAIL_ALREADY = "Sorry, such email is already registered.";
const NO_POSTS_YET = "No posts yet...";
const INVALID_TOKEN = "Invalid token";
const NO_POST_OWNER ='post not owner this user';

const ERRORS = {
    NO_FOUND_USER,
    NO_FOUND_POST,
    NO_FOUND_FAVORITE,
    NO_FOUND_FOLLOWS,
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
const ADD_FAVORITE = "ADD_FAVORITE";
const DELETE_FAVORITE = "DELETE_FAVORITE";
const GET_POSTS_BY_TOKEN = "GET_POSTS_BY_TOKEN";
const GET_POSTS_BY_AUTHOR = "GET_POSTS_BY_AUTHOR";
const GET_POSTS_BY_FEVORITED = "GET_POSTS_BY_FEVORITED";

const OPERATION = {
    ADD_FOLLOW,
    DELETE_FOLLOW,
    ADD_FAVORITE,
    DELETE_FAVORITE,
    GET_POSTS_BY_TOKEN,
    GET_POSTS_BY_FEVORITED,
    GET_POSTS_BY_AUTHOR
}

module.exports.COLLECTIONS = COLLECTIONS;
module.exports.ERRORS = ERRORS;
module.exports.MESSAGE = MESSAGE;
module.exports.OPERATION = OPERATION;
