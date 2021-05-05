import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import publisherRoutes from "./routes/publications.js"
import notifRoutes from "./routes/notifs.js";
import {initiateServer, CONNECTION_URL} from './config/db.js';
import multer from 'multer'

const app = express();
var upload = multer();

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(upload.any());

app.use('/posts', postRoutes);
app.use('/user', userRoutes);
app.use('/publisher', publisherRoutes);
app.use('/notif', notifRoutes);

const PORT = process.env.PORT || 5000;
initiateServer(PORT, CONNECTION_URL, app);