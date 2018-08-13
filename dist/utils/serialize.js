"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Serialize {
    constructor() {
        this.getUser = (user) => {
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
        };
        this.getSettings = (user) => {
            return {
                name: user.name,
                email: user.email,
                bio: user.bio,
                image: user.image
            };
        };
        this.getComment = (comment) => {
            return {
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt,
                author: this.getAuthor(comment.author)
            };
        };
        this.getProfile = (user) => {
            return {
                user: {
                    name: user.name,
                    email: user.email,
                    bio: user.bio,
                    image: user.image,
                    following: user.following
                }
            };
        };
        this.getFollower = (user) => {
            return {
                name: user.name,
                bio: user.bio,
                image: user.image,
                following: user.following,
                followers: user.followers.length,
                favorites: user.favorites.length
            };
        };
        this.getPost = (post) => {
            return {
                id: post.id,
                title: post.title,
                topic: post.topic,
                message: post.message,
                tags: post.tags.map(tag => tag.text),
                favorited: post.favorited,
                favouritesCount: post.favouritesCount,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                author: this.getAuthor(post.author)
            };
        };
        this.setUpdatePost = (post) => {
            return {
                id: post.id,
                title: post.title,
                topic: post.topic,
                message: post.message,
                tags: post.tags,
            };
        };
        this.getCurrentUserFromBody = (body) => {
            let currentUser = body.currentUser;
            delete body.currentUser;
            return { body, currentUser };
        };
        this.sendPosts = (posts, count) => {
            return {
                posts: posts.map(post => this.getPost(post)),
                count
            };
        };
        this.getAuthor = (author) => {
            return {
                name: author.name,
                image: author.image
            };
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