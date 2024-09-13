
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import express from "express";
import ApiError from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import {JwtType} from "../middlewares/userAuthorization.middleware";
import Jwt from "jsonwebtoken";


const registerUser = asyncHandler(async (req: any, res: express.Response) => {
    const { fullName, username, email, password } = req.body;
    const validationErrors: string[] = [];
    const fieldsToVerify = [
        { field: fullName, name: "Full Name" },
        { field: username, name: "Username" },
        { field: email, name: "Email" },
        { field: password, name: "Password" }
    ];
    fieldsToVerify.forEach(({ field, name }) => {
        if (!field || (typeof field === 'string' && field.trim() === '')) {
            validationErrors.push(`${name} is required.`);
        }
    });
    if (validationErrors.length > 0) {
        throw new ApiError(400, "Validation failed.", validationErrors);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (existingUser) throw new ApiError(409, "User already exists");

    // Handle file uploads
    const avatarFile = req.files?.avatar?.[0];
    const coverImageFile = req.files?.coverImage?.[0];

    if (!avatarFile) throw new ApiError(400, "Avatar image is required.");

    const avatar = await uploadOnCloudinary(avatarFile.path);
    const coverImage = coverImageFile ? await uploadOnCloudinary(coverImageFile.path) : null;

    if (!avatar) throw new ApiError(400, "Failed to upload avatar image.");

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) throw new ApiError(404, "User not found.");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully.")
    );
});

const loginUser = asyncHandler(async (req: any, res: express.Response) => {
    const { email, password } = req.body;
    const validationErrors: string[] = [];
    const fieldsToVerify = [
        { field: email, name: "Email" },
        { field: password, name: "Password" },
    ];
    fieldsToVerify.forEach(({ field, name }) => {
        if (!field || (typeof field === 'string' && field.trim() === '')) {
            validationErrors.push(`${name} is required.`);
        }
    });
    if (validationErrors.length > 0) {
        throw new ApiError(400, "Validation failed.", validationErrors);
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) throw new ApiError(404, "User not found.");

    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) throw new ApiError(401, "Password is incorrect.");

    let refreshToken = existingUser.generateRefreshToken();
    let accessToken = existingUser.generateAccessToken();
    existingUser.refreshToken = refreshToken;
    await existingUser.save({validateBeforeSave:false})
    const options = {
        httpOnly: true,
        secure: true,
        path: "/"
    };

    const responseLogin = await User.findOne({email}).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, responseLogin, "Successfully Login"));
});

const logoutUser = asyncHandler (async ( req: any ,res: express.Response ) => {
    if (!req.user) {
        return res.status(401).json(new ApiError(401, 'User not authenticated.'));
    }
  const savedUser = await User.findByIdAndUpdate (req.user._id ,{
            $set:{
                refreshToken:undefined ,
            }
        } ,
        {new:true}
    );
    if (!savedUser) throw new ApiError(400,"User not Authenticated to Perform This Action")
    const options = {
        httpOnly: true,
        secure: true,
        path:"/"
    }

    return res.status(200)
        .clearCookie("refreshToken",options)
        .clearCookie("accessToken",options)
        .json(
            new ApiResponse(200,{logout:true},"logout successfully.")
        )

})

const refreshUserToken = asyncHandler(async ( req: any ,res: express.Response ) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if(!token) return res.status(401).json(new ApiError(401, 'User not authenticated.'));
        const key = process.env.JWT_REFRESH_SECRET_KEY!;
        const refreshToken = Jwt.verify(token, key) as JwtType;
        if (!refreshToken) throw new ApiError(401, 'Invalid refresh token.');

        const user = await User.findById(refreshToken._id).exec();
        if (!user || user.refreshToken !== token) throw new ApiError(401, 'Refresh token not found or mismatched.');
        const accessToken =  user.generateAccessToken();
        const options = {
            httpOnly: true,
            secure: true,
            path: "/"
        }
        return res.status(200)
            .cookie("accessToken",accessToken,options)
            .json(
                new ApiResponse(200, {refresh:true},"logout successfully.")
            )
})

const  updateUser =  asyncHandler(async ( req: any ,res: express.Response ) => {
    const {username,fullName} = req.body;
    if (!req.user) throw new ApiError(401, 'User not authenticated.');
    const user = await User.findByIdAndUpdate (req.user._id ,{
        $set:{
            username:username,
            fullName:fullName,
        }
    },{new:true})

    const newUser = await User.findById(req.user._id).select("-password -refreshToken");
    if (!newUser) throw new ApiError(401, 'User not Authenticated.');
    return res.status(200)
        .json(new ApiResponse(200, newUser, "Successfully Updated"));
});
const updateUserAvatar = asyncHandler(async ( req: any ,res: express.Response ) => {

})
const updateUserCoverImage = asyncHandler(async ( req: any ,res: express.Response ) => {

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshUserToken,
    updateUser,
    updateUserAvatar,
    updateUserCoverImage,
};
