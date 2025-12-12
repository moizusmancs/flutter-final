import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { Admin } from "../../types/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// POST /admin/auth/login - Admin login
export const handleAdminLogin = AsyncCall(async (req, res, next) => {
    const { email, password } = req.body;

    // Get admin by email
    const admins = await queryDb<Admin[]>(
        "SELECT id, username, email, password_hash, role FROM admins WHERE email = ?",
        [email]
    );

    if (admins.length === 0) {
        return next(new CustomError("Invalid credentials", 401));
    }

    const admin = admins[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash!);

    if (!isPasswordValid) {
        return next(new CustomError("Invalid credentials", 401));
    }

    // Generate JWT token
    const token = jwt.sign(
        { adminId: admin.id },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );

    // Set token in HTTP-only cookie (separate cookie for admins)
    res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        }
    });
});

// POST /admin/auth/logout - Admin logout
export const handleAdminLogout = AsyncCall(async (_req, res, _next) => {
    // Clear admin token cookie with same options as when set
    res.clearCookie("admin_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Admin logged out successfully"
    });
});

// GET /admin/auth/check - Check if admin is authenticated
export const handleCheckAuth = AsyncCall(async (req, res, _next) => {
    // Admin info is already attached to req by adminAuthMiddleware
    const admin = req.admin!;

    res.status(200).json({
        success: true,
        message: "Admin is authenticated",
        admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        }
    });
});
