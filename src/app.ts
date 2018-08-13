import * as express from "express";
import * as bodyParser from "body-parser";
const cors = require('cors');
import * as mongoose from "mongoose";
const option = { 
    useNewUrlParser: true 
}

import UserRoutes from "./routes/userRoutes";
import PostRoutes from "./routes/postRoutes";
import CommentRoutes from "./routes/commentRoutes";
import TagRoutes from "./routes/tagRoutes";
import ProfileRoutes from "./routes/profileRoutes";

class App {
    public app: express.Application;

    constructor(){
        this.app = express();
        this.config();
        this.routes();
    }

    private config() {
        const MONGO_URL = 'mongodb://127.0.0.1:27017/node';
        mongoose.connect(MONGO_URL, option, (error) => {
            if(error) console.log(error);
            else console.log("Connected with DB");
        });

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cors({ origin: '*'}));
    }

    private routes(): void{
        // const router: express.Router = express.Router();

        this.app.use('/api/user', UserRoutes);
        this.app.use('/api/post', PostRoutes);
        this.app.use('/api/post/:id/comments', CommentRoutes);
        this.app.use('/api/tags', TagRoutes);
        this.app.use('/api/profile/:username', ProfileRoutes);
    }
}

export default new App().app;