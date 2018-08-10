"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const option = {
    useNewUrlParser: true
};
const userRoutes_1 = require("./routes/userRoutes");
class App {
    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }
    config() {
        const MONGO_URL = 'mongodb://127.0.0.1:27017/node';
        mongoose.connect(MONGO_URL, option, (error) => {
            if (error)
                console.log(error);
            else
                console.log("Connected with DB");
        });
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cors({ origin: '*' }));
    }
    routes() {
        // const router: express.Router = express.Router();
        this.app.use('/api/user', userRoutes_1.default);
        // this.app.use('/api/post/:id/comments', CommentRoutes);
        // this.app.use('/api/tags', TagRoutes);
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map