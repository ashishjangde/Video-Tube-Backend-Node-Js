import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Jwt from 'jsonwebtoken';
import { User, UserTypes } from "../models/user.model.js"; // Import IUser interface

interface JwtPayload {
    _id: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserTypes;
        }
    }
}

export const verifyUserJwt = asyncHandler(async (req: Request,_res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken || req.headers['authorization']?.replace('Bearer ', '');

        if (!token) {
            return next(new ApiError(401, 'Unauthorized Access'));
        }

        const accessTokenSecret = process.env.JWT_ACCESS_SECRET_KEY!;

        const verification = Jwt.verify(token, accessTokenSecret) as JwtPayload;

        if (!verification) {
            return next(new ApiError(401, 'Unverified Access'));
        }
        const user = await User.findById(verification._id).exec(); // Ensure to use exec() for a promise

        if (!user) {
            return next(new ApiError(401, 'Unauthorized'));
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying JWT:', error);

        if (error instanceof Jwt.JsonWebTokenError) {
            return next(new ApiError(401, 'Invalid Token'));
        }
        return next(new ApiError(400, 'Unable to verify user token'));
    }
});

export type JwtType = JwtPayload;
