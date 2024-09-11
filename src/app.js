import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({limit: "50kb"}));
app.use(express.urlencoded({ extended: true , limit: "50kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

//routes import
import userRoutes from "./routes/user.routes.js";

//routes declaration
app.use(`${process.env.DEFAULT_URL}/users`, userRoutes);



export{app}