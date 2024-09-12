import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";


export const configureDb = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
        console.log(`DB connection successfully  ${connection.connection.host} `);
    }catch(err) {
        console.log(`DB connection failed: ${err}`);
        process.exit(1);
    }

}