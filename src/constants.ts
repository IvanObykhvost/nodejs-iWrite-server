//errors
const no_found_user = 'No found user';
const no_found_post = 'No found post';
const no_found_comment = "No found comment";
const no_found_tag = "No found tag";
const no_found_followers = "No found follower users";
const no_found_followings = "No found following users";
const no_post_owner ='Post not owner this user';
const no_found_feed = "No found feed";

const invalid_credentials = "Invalid email or password";
const invalid_token = "Invalid token";
const username_already_use = "Sorry, such username is already use";
const email_already = "Sorry, such email is already registered";
const property_is_empty = (property: string) => `${property} can not be empty`;

//message
const successfully_login = 'Successfully login';
const succesfully_updated_user = 'Succesfully updated user';
const successfully_signed = 'Successfully signed';
const successfully_added = 'Successfully added';
const successfully_removed_post = 'Successfully removed post';
const succesfully_updated_post = 'Succesfully updated post';
const successfully_removed_favorite = 'Successfully removed favorite';


//operations
const add_comment= "add_comment";
const delete_comment = "delete_comment";
const add_follower= "add_follower";
const delete_follower = "delete_follower";
const get_followers = "get_followers";
const get_followings = "get_followings";
const get_posts_by_token  = "GET_POSTS_BY_TOKEN";
const get_posts_by_author = "GET_POSTS_BY_AUTHOR";
const get_posts_by_favorited = "GET_POSTS_BY_FAVORITED";
const add_favorited = "ADD_FAVORITED";
const delete_favorited  = "DELETE_FAVORITED";

export const constants = {
    errors: {
        no_found_user,
        no_found_comment,
        no_found_post,
        no_found_tag,
        no_found_followers,
        no_found_followings,
        no_post_owner,
        no_found_feed,
        
        invalid_credentials,
        invalid_token,
        username_already_use,
        email_already,
        property_is_empty
    },

    message: {
        successfully_login,
        succesfully_updated_user,
        successfully_signed,
        successfully_added,
        successfully_removed_post,
        succesfully_updated_post,
        successfully_removed_favorite
    },

    operation: {
        add_comment,
        delete_comment,
        add_follower,
        delete_follower,
        get_followers,
        get_followings,
        get_posts_by_token,
        get_posts_by_author,
        get_posts_by_favorited,
        add_favorited,
        delete_favorited
    }
}