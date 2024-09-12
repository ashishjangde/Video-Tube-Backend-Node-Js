import express from 'express';
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json({
    limit: '50kb',
}));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.static("public"));
app.use(cookieParser());

//imports

import UserRoutes from "../src/routes/user.routes.js";

app.use("/api/v1/users", UserRoutes);


export {app}