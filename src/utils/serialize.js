function Serialize(){
    this.getPost = (post) => {
        return {
            id: post.id,
            title: post.title,
            topic: post.topic,
            message: post.message,
            tags: post.tags,
            favorited: post.favorited,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: this.getAuthor(post.author)
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
    this.getProfile = (user) => {
        return {
            user: {
                name: user.name,
                email: user.email,
                bio: user.bio,
                image: user.image
            }
        }
    },
    this.setUpdatePost = (post) =>{
        return {
            id: post.id,
            title: post.title,
            topic: post.topic,
            message: post.message,
            tags: post.tags
        }
    },
    this.error = (error) => {
        return {
            error
        }
    }
}

module.exports.Serialize = new Serialize();