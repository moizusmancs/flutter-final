import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../utils/customError.js";
import { queryDb } from "../utils/queryDb.js";
import { User } from "../types/user.js";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                fullname: string;
            };
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;

        if (!token) {
            return next(new CustomError("Authentication required", 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

        // Get user from database
        const users = await queryDb<User[]>(
            "SELECT id, email, fullname FROM users WHERE id = ?",
            [decoded.userId]
        );

        if (users.length === 0) {
            return next(new CustomError("User not found", 404));
        }

        // Attach user to request
        req.user = {
            id: users[0].id!,
            email: users[0].email,
            fullname: users[0].fullname
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new CustomError("Invalid token", 401));
        }
        next(error);
    }
};
