import express from "express";
import { connectDB } from "./db/index.js";
import dotenv from "dotenv";


const app = express();  
dotenv.config();
const PORT = process.env.PORT || 5000;

connectDB()
.then(() =>{
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
})
.catch((error) => {
    console.log(`Error while connecting to Database: ${error.message}`);
    
});