import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    try {
       const connection = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
       console.log(`MongoDB Connected: ${connection.connection.host}`);
       
    }catch (err) {
        console.log(`error while connecting to MongoDB: ${err.message}`);
        process.exit(1);
    }
}