import {model, Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        
    },
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,  
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,  
        index: true,
    },
    password: {
        type: String,
        required: [true,"password is required"]
    },
    avatar: {
        type: String
    },
    coverImage:{
        type: String,
    },
    refreshToken: {
        type: String,
    },
    videoHistory: {
        type: [Schema.Types.ObjectId],
        ref: "Video"
    },

}); 


UserSchema.pre("save", async function (next) {
   if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

UserSchema.methods.generateAccessToken = function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
                fullName: this.fullName,

            },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY}
        );
    } catch (error) {
        console.error("Error generating access token:", error);
        throw new Error("Token generation failed.");
    }
};

UserSchema.methods.generateRefreshToken = function () {
    try {

        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY
            },
        );
    } catch (error) {       
        console.error("Error generating refresh token:", error);
        throw new Error("Token generation failed.");
    }

}

export const User = model("User" , UserSchema);