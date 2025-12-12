import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../utils/customError.js";
import { queryDb } from "../utils/queryDb.js";
import { Admin } from "../types/admin.js";

// Extend Express Request type to include admin
declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: number;
                username: string;
                email: string;
                role: 'super_admin' | 'admin' | 'moderator';
            };
        }
    }
}

export const adminAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from cookie (using separate cookie name for admins)
        const token = req.cookies.admin_token;

        if (!token) {
            return next(new CustomError("Admin authentication required", 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { adminId: number };

        // Get admin from database
        const admins = await queryDb<Admin[]>(
            "SELECT id, username, email, role FROM admins WHERE id = ?",
            [decoded.adminId]
        );

        if (admins.length === 0) {
            return next(new CustomError("Admin not found", 404));
        }

        // Attach admin to request
        req.admin = {
            id: admins[0].id!,
            username: admins[0].username,
            email: admins[0].email,
            role: admins[0].role
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new CustomError("Invalid admin token", 401));
        }
        next(error);
    }
};
