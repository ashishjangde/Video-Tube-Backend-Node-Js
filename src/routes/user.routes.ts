import { Router } from "express";
import {Upload} from "../middlewares/multer.middleware.js";
import { verifyUserJwt } from "../middlewares/userAuthorization.middleware.js";



const router = Router();

// imports
import {
    registerUser ,
    loginUser ,
    logoutUser ,
    refreshUserToken,
    updateUser,
} from "../controllers/user.controller.js";



//routes
router.route("/register").post(
    Upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
//secure Routes
router.route("/logout").post(verifyUserJwt,logoutUser)
router.route("/refresh").post(refreshUserToken)
router.route("/update").post(verifyUserJwt,updateUser)






export default router;