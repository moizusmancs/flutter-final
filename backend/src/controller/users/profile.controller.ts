import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import { User } from "../../types/user.js";
import CustomError from "../../utils/customError.js";
import bcrypt from "bcrypt";
import { ResultSetHeader } from "mysql2";

// GET /profile - Get user profile
export const handleGetProfile = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id; // From auth middleware

    const users = await queryDb<User[]>(
        "SELECT id, fullname, email, phone, created_at FROM users WHERE id = ?",
        [userId]
    );

    if (users.length === 0) {
        return next(new CustomError("User not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        user: users[0]
    });
});

// PUT /profile - Update user profile (fullname and/or phone)
export const handleUpdateProfile = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const updates = req.body; // Already validated by Zod

    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        return next(new CustomError("No fields to update", 400));
    }

    const setClause = fields.map(field => `${field} = ?`).join(", ");

    const result = await queryDb<ResultSetHeader>(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        [...values, userId]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("User not found", 404));
    }

    // Fetch updated user data
    const updatedUsers = await queryDb<User[]>(
        "SELECT id, fullname, email, phone, created_at FROM users WHERE id = ?",
        [userId]
    );

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUsers[0]
    });
});

// PUT /password - Change user password
export const handleChangePassword = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body; // Already validated by Zod

    // Get current user with password
    const users = await queryDb<User[]>(
        "SELECT id, hashed_password FROM users WHERE id = ?",
        [userId]
    );

    if (users.length === 0) {
        return next(new CustomError("User not found", 404));
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].hashed_password);

    if (!isPasswordValid) {
        return next(new CustomError("Current password is incorrect", 400));
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const result = await queryDb<ResultSetHeader>(
        "UPDATE users SET hashed_password = ? WHERE id = ?",
        [newHashedPassword, userId]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update password", 500));
    }

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
});
