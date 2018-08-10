"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Serialize {
    constructor() {
        this.getComment = (comment) => {
            return {
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt,
                author: this.getAuthor(comment.author)
            };
        };
        this.getAuthor = (author) => {
            return {
                name: author.name,
                image: author.image
            };
        };
    }
    getUser(user) {
        return {
            user: {
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                bio: user.bio,
                image: user.image,
                token: user.token
            }
        };
    }
    getSettings(user) {
        return {
            name: user.name,
            email: user.email,
            bio: user.bio,
            image: user.image
        };
    }
    success(message) {
        return {
            success: message
        };
    }
    error(message) {
        return {
            error: message
        };
    }
}
exports.Serialize = Serialize;
//# sourceMappingURL=serialize.js.map