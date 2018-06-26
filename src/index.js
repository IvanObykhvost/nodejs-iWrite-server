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

const UserController = require('./controllers/userController');
const PostController = require('./controllers/postController');

//UserController
app.get('/api/user', UserController.getUserByToken);
app.post('/api/register', UserController.registerUser);
app.post('/api/login', UserController.loginUser);
// app.put('/api/user', )

//PostController
app.get('/api/posts', PostController.getAllPosts);
//app.get('/api/post/:id', PostController.getPost);
app.get('/api/post/:username', PostController.getPostByUsername);
app.post('/api/post', PostController.addPost);
app.put('/api/post/:id', PostController.updatePost);

const port = process.env.POR || 4081;
app.listen(port, () => console.log(`Listening on port ${port}`));