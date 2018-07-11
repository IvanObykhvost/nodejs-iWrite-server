function Serialize(){
    this.getPost = (post) => {
        return {
            id: post.id,
            title: post.title,
            topic: post.topic,
            message: post.message,
            tags: post.tags,
            favorited: post.favorited,
            favouritesCount: post.favouritesCount,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: this.getAuthor(post.author)
        }
    },
    this.getPostFull = (post) => {
        return {
            id: post.id,
            title: post.title,
            topic: post.topic,
            message: post.message,
            tags: post.tags,
            favorited: post.favorited,
            favouritesCount: post.favouritesCount,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: this.getAuthor(post.author),
            comments: post.comments.map(comment => this.getComment(comment))
        }
    },
    this.getAuthor = (author) => {
        return {
            name: author.name,
            image: author.image
        }
    },
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
    this.getCurrentUser = (user) => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            token:  user.token
        }
    },
    this.getSetting = (user) => {
        return {
            user: {
                name: user.name,
                email: user.email,
                bio: user.bio,
                image: user.image,
            }
        }
    },
    this.getProfile = (user) => {
        return {
            user: {
                name: user.name,
                email: user.email,
                bio: user.bio,
                image: user.image,
                following: user.following
            }
        }
    },
    this.getComment = (comment) => {
        return {
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt,
                author: this.getAuthor(comment.author)
        }
    },
    this.setUpdatePost = (post) =>{
        return {
            id: post.id,
            title: post.title,
            topic: post.topic,
            message: post.message,
            tags: post.tags,
        }
    },

    this.getCurrentUserFromBody = (body) => {
        let currentUser = body.currentUser;
        delete body.currentUser;
        return {body, currentUser};
    },
    this.success = (success) => {
        return {
            success
        }
    },
    this.error = (error) => {
        return {
            error
        }
    }
}

module.exports.Serialize = new Serialize();