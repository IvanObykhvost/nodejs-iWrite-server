const USERS = "users";
const POSTS = "posts";

const COLLECTIONS = {
    USERS,
    POSTS
};

const NO_FOUND_USER = "No found user";
const NO_FOUND_POST = "No found post";
const NO_FOUND_POSTS = "No found posts";
const NO_FOUND_FAVORITE = "No found favorite";
const NO_FOUND_FOLLOWS = "No found follows user";
const NO_FOUND_COMMENT = "No found comment";
const NO_FOUND_COMMENTS = "No found comments";
const NO_FOUND_TAG = "No found tag";
const INVALID_CREDENTIALS = "Invalid email or password";
const EMAIL_ALREADY = "Sorry, such email is already registered";
const USERNAME_ALREADY_USE = "Sorry, such username is already use";
const NO_POSTS_YET = "No posts yet...";
const INVALID_TOKEN = "Invalid token";
const NO_POST_OWNER ='post not owner this user';

const PROPERTY_IS_EMPTY = (property) => `${property} can not be empty`;

const ERRORS = {
    NO_FOUND_USER,
    NO_FOUND_POST,
    NO_FOUND_POSTS,
    NO_FOUND_FAVORITE,
    NO_FOUND_FOLLOWS,
    NO_POST_OWNER,
    NO_FOUND_COMMENT,
    NO_FOUND_COMMENTS,
    NO_FOUND_TAG,
    EMAIL_ALREADY,
    USERNAME_ALREADY_USE,
    INVALID_CREDENTIALS,
    INVALID_TOKEN,
    //validate errors
    PROPERTY_IS_EMPTY
};

const SUCCESSFULLY_SIGNED = 'Successfully signed';
const SUCCESSFULLY_REMOVED_SUBSCRIPTION = 'Successfully removed subscription';
const SUCCESSFULLY_ADDED = 'Successfully added';
const SUCCESFULLY_UPDATED_USER = 'Succesfully updated user';
const SUCCESFULLY_UPDATED_POST = 'Succesfully updated post';
const SUCCESSFULLY_REMOVED_POST = 'Successfully removed post';
const SUCCESSFULLY_REMOVED_FAVORITE = 'Successfully removed favorite';
const SUCCESSFULLY_LOGIN = 'Successfully login';


const MESSAGE = {
    SUCCESSFULLY_SIGNED,
    SUCCESSFULLY_REMOVED_SUBSCRIPTION,
    SUCCESSFULLY_ADDED,
    NO_POSTS_YET,
    SUCCESFULLY_UPDATED_USER,
    SUCCESFULLY_UPDATED_POST,
    SUCCESSFULLY_REMOVED_FAVORITE,
    SUCCESSFULLY_REMOVED_POST,
    SUCCESSFULLY_LOGIN
}

const ADD_FOLLOW = "ADD_FOLLOW";
const DELETE_FOLLOW = "DELETE_FOLLOW";
const ADD_FAVORITE = "ADD_FAVORITE";
const DELETE_FAVORITE = "DELETE_FAVORITE";
const ADD_COMMENT= "ADD_COMMENT";
const DELETE_COMMENT = "DELETE_COMMENT";
const GET_POSTS_BY_TOKEN = "GET_POSTS_BY_TOKEN";
const GET_POSTS_BY_AUTHOR = "GET_POSTS_BY_AUTHOR";
const GET_POSTS_BY_FAVORITED = "GET_POSTS_BY_FAVORITED";

const OPERATION = {
    ADD_FOLLOW,
    DELETE_FOLLOW,
    ADD_FAVORITE,
    DELETE_FAVORITE,
    ADD_COMMENT,
    DELETE_COMMENT,
    GET_POSTS_BY_TOKEN,
    GET_POSTS_BY_FAVORITED,
    GET_POSTS_BY_AUTHOR
}



module.exports.COLLECTIONS = COLLECTIONS;
module.exports.ERRORS = ERRORS;
module.exports.MESSAGE = MESSAGE;
module.exports.OPERATION = OPERATION;
