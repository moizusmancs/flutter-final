import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import { UserAddress } from "../../types/address.js";
import CustomError from "../../utils/customError.js";
import { ResultSetHeader } from "mysql2";

// GET /addresses - Get all user addresses
export const handleGetUserAddresses = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id; // From auth middleware

    const addresses = await queryDb<UserAddress[]>(
        "SELECT * FROM user_address WHERE user_id = ? ORDER BY is_default DESC, id DESC",
        [userId]
    );

    res.status(200).json({
        success: true,
        message: "Addresses fetched successfully",
        addresses
    });
});

// POST /addresses - Create new address
export const handleCreateAddress = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { line1, city, state, country, zip_code, is_default } = req.body;

    // If this is set as default, unset all other defaults for this user
    if (is_default) {
        await queryDb(
            "UPDATE user_address SET is_default = 0 WHERE user_id = ?",
            [userId]
        );
    }

    const result = await queryDb<ResultSetHeader>(
        `INSERT INTO user_address (user_id, line1, city, state, country, zip_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, line1, city, state, country, zip_code, is_default]
    );

    if (!result || !result.insertId) {
        return next(new CustomError("Failed to create address", 500));
    }

    res.status(201).json({
        success: true,
        message: "Address created successfully",
        address: {
            id: result.insertId,
            user_id: userId,
            line1,
            city,
            state,
            country,
            zip_code,
            is_default
        }
    });
});

// PUT /addresses/:id - Update address
export const handleUpdateAddress = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const updates = req.body; // Already validated by Zod

    // Check ownership - user must own this address
    const addressCheck = await queryDb<UserAddress[]>(
        "SELECT * FROM user_address WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (addressCheck.length === 0) {
        return next(new CustomError("Address not found", 404));
    }

    // If no fields to update
    if (Object.keys(updates).length === 0) {
        return next(new CustomError("No fields to update", 400));
    }

    // If setting as default, unset other defaults
    if (updates.is_default === true) {
        await queryDb(
            "UPDATE user_address SET is_default = 0 WHERE user_id = ?",
            [userId]
        );
    }

    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(", ");

    const result = await queryDb<ResultSetHeader>(
        `UPDATE user_address SET ${setClause} WHERE id = ? AND user_id = ?`,
        [...values, id, userId]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update address", 500));
    }

    // Fetch updated address
    const updatedAddress = await queryDb<UserAddress[]>(
        "SELECT * FROM user_address WHERE id = ?",
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Address updated successfully",
        address: updatedAddress[0]
    });
});

// DELETE /addresses/:id - Delete address
export const handleDeleteAddress = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check ownership before deleting
    const addressCheck = await queryDb<UserAddress[]>(
        "SELECT * FROM user_address WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (addressCheck.length === 0) {
        return next(new CustomError("Address not found", 404));
    }

    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM user_address WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to delete address", 500));
    }

    res.status(200).json({
        success: true,
        message: "Address deleted successfully"
    });
});

// PUT /addresses/:id/default - Set address as default
export const handleSetDefaultAddress = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify ownership
    const addressCheck = await queryDb<UserAddress[]>(
        "SELECT * FROM user_address WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (addressCheck.length === 0) {
        return next(new CustomError("Address not found", 404));
    }

    // Unset all defaults for this user
    await queryDb(
        "UPDATE user_address SET is_default = 0 WHERE user_id = ?",
        [userId]
    );

    // Set new default
    const result = await queryDb<ResultSetHeader>(
        "UPDATE user_address SET is_default = 1 WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to set default address", 500));
    }

    res.status(200).json({
        success: true,
        message: "Default address updated successfully"
    });
});
