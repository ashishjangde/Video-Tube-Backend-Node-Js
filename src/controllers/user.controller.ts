import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import express from "express";
import ApiError from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


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
        new ApiResponse(201, createdUser, "User created successfully.") // getting error in this line <html>TS2345: Argument of type 'Document&lt;unknown, {}, IUser&gt; &amp; IUser &amp; Required&lt;{ _id: unknown; }&gt;' is not assignable to parameter of type 'Query&lt;any, any, unknown, unknown, &quot;findOne&quot;, unknown&gt; | undefined'.<br/>Type 'Document&lt;unknown, {}, IUser&gt; &amp; IUser &amp; Required&lt;{ _id: unknown; }&gt;' is missing the following properties from type 'Query&lt;any, any, unknown, unknown, &quot;findOne&quot;, unknown&gt;': _mongooseOptions, exec, all, allowDiskUse, and 84 more.
    );
});

export { registerUser };
