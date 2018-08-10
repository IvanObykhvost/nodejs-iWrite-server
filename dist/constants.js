"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//errors
const no_found_user = 'No found user';
const no_found_post = 'No found post';
const no_found_comment = "No found comment";
const no_found_tag = "No found tag";
const invalid_credentials = "Invalid email or password";
const invalid_token = "Invalid token";
const username_already_use = "Sorry, such username is already use";
const email_already = "Sorry, such email is already registered";
const property_is_empty = (property) => `${property} can not be empty`;
//message
const successfully_login = 'Successfully login';
const succesfully_updated_user = 'Succesfully updated user';
//operations
const add_comment = "add_comment";
const delete_comment = "delete_comment";
exports.constants = {
    errors: {
        no_found_user,
        no_found_comment,
        no_found_post,
        no_found_tag,
        invalid_credentials,
        invalid_token,
        username_already_use,
        email_already,
        property_is_empty
    },
    message: {
        successfully_login,
        succesfully_updated_user
    },
    operation: {
        add_comment,
        delete_comment
    }
};
//# sourceMappingURL=constants.js.map