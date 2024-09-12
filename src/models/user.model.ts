import {model, Schema, Document, CallbackError} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface IUser extends Document {
    fullName: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    coverImage?: string;
    refreshToken?: string;
    videoHistory: Schema.Types.ObjectId[];
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const UserSchema = new Schema<IUser>({
    fullName: {
        type: String,
        required: true,
    },
    username: {
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
        required: [true, "password is required"],
    },
    avatar: {
        type: String,
    },
    coverImage: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    videoHistory: {
        type: [Schema.Types.ObjectId],
        ref: "Video",
    },
});

UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error as CallbackError);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateAccessToken = function (): string {
    try {
        const secretKey = process.env.JWT_ACCESS_SECRET_KEY!;
        const expiresIn = process.env.JWT_ACCESS_EXPIRY ;
        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
                fullName: this.fullName,
            },
            secretKey,
            { expiresIn }
        );
    } catch (error) {
        console.error("Error generating access token:", error);
        throw new Error("Token generation failed.");
    }
};

UserSchema.methods.generateRefreshToken = function (): string {
    try {
        const secretKey = process.env.JWT_REFRESH_SECRET_KEY_!;
        const expiresIn = process.env.JWT_REFRESH_EXPIRY; // default to 7 days
        return jwt.sign(
            {
                _id: this._id,
            },
            secretKey,
            { expiresIn }
        );
    } catch (error) {
        console.error("Error generating refresh token:", error);
        throw new Error("Token generation failed.");
    }
};

export const User = model<IUser>("User", UserSchema);
