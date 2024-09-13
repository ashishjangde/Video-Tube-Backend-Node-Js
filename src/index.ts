import { app } from "./app.js";
import dotenv from 'dotenv';
import { configureDb } from "./db/configureDb.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

configureDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(`Server failed with error: ${err}`);
    })



