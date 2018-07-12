const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

//use cors
app.use(cors({ origin: '*'}));

// create application/json parser
app.use(bodyParser.json());

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));

//include controllers
const AuthController = require('./controllers/authController');
const UserController = require('./controllers/userController');
const PostController = require('./controllers/postController');
const ProfileController = require('./controllers/profileController');
const TagController = require('./controllers/tagController');

//UserController
app.get('/api/user', UserController.getUserByToken);
app.post('/api/register', UserController.registerUser);
app.post('/api/login', UserController.loginUser);
app.put('/api/user', AuthController.authentication, UserController.saveUser);

//PostController
app.get('/api/posts', PostController.getAllPosts);
app.get('/api/posts/feed', AuthController.authentication, PostController.getPostsByFeed);
app.get('/api/post/:id', PostController.getPost);
app.post('/api/post', AuthController.authentication, PostController.addPost);
app.put('/api/post/:id', AuthController.authentication, PostController.updatePost);
app.delete('/api/post/:id', AuthController.authentication, PostController.deletePost);
//favorites
app.post('/api/post/:id/favorite', AuthController.authentication, PostController.addFavorite);
app.delete('/api/post/:id/unfavorite', AuthController.authentication, PostController.deleteFavorite);
//conmments
app.get('/api/post/:id/comments', PostController.getComments);
app.post('/api/post/:id/comments', AuthController.authentication, PostController.addComment);
app.delete('/api/post/:id/comments/:commentId', AuthController.authentication, PostController.deleteComment);

//ProfileController
app.get('/api/profile/:username', ProfileController.getProfile);
app.post('/api/profile/:username/follow', AuthController.authentication, ProfileController.follow);
app.delete('/api/profile/:username/unfollow', AuthController.authentication, ProfileController.unfollow);

//TagController
app.get('/api/tags', TagController.getPopularTags);

const port = process.env.POR || 4081;
app.listen(port, () => console.log(`Listening on port ${port}`));