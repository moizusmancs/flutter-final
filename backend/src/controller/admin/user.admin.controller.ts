import { NextFunction, Request, Response } from "express";
import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import { ResultSetHeader } from "mysql2";
import { User } from "../../types/user.js";
import CustomError from "../../utils/customError.js";

// GET /admin/users - Get all users
export const handleGetAllUsers = AsyncCall(async (req, res, _next) => {
    const { is_blocked } = req.query;

    let query = `
        SELECT
            id,
            fullname,
            email,
            phone,
            COALESCE(is_blocked, FALSE) as is_blocked,
            created_at
        FROM users
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (is_blocked !== undefined) {
        conditions.push("COALESCE(is_blocked, FALSE) = ?");
        values.push(is_blocked === 'true');
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC";

    const users = await queryDb<any[]>(query, values);

    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users,
        count: users.length
    });
});

// GET /admin/users/:id - Get user details
export const handleGetUserDetails = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Get user details
    const users = await queryDb<any[]>(
        `SELECT
            id,
            fullname,
            email,
            phone,
            COALESCE(is_blocked, FALSE) as is_blocked,
            created_at
        FROM users
        WHERE id = ?`,
        [id]
    );

    if (users.length === 0) {
        return next(new CustomError("User not found", 404));
    }

    // Get user's addresses count
    const addressCount = await queryDb<any[]>(
        "SELECT COUNT(*) as count FROM addresses WHERE user_id = ?",
        [id]
    );

    // Get user's orders count
    const orderCount = await queryDb<any[]>(
        "SELECT COUNT(*) as count FROM orders WHERE user_id = ?",
        [id]
    );

    // Get user's total spending
    const spending = await queryDb<any[]>(
        `SELECT
            COALESCE(SUM(total_amount), 0) as total_spent,
            COUNT(*) as order_count
        FROM orders
        WHERE user_id = ? AND status != 'cancelled'`,
        [id]
    );

    res.status(200).json({
        success: true,
        message: "User details fetched successfully",
        user: {
            ...users[0],
            addresses_count: addressCount[0].count,
            orders_count: orderCount[0].count,
            total_spent: spending[0].total_spent,
            completed_orders: spending[0].order_count
        }
    });
});

// GET /admin/users/:id/orders - Get user orders
export const handleGetUserOrders = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if user exists
    const users = await queryDb<User[]>(
        "SELECT id FROM users WHERE id = ?",
        [id]
    );

    if (users.length === 0) {
        return next(new CustomError("User not found", 404));
    }

    // Get user's orders
    const orders = await queryDb<any[]>(
        `SELECT
            o.id,
            o.total_amount,
            o.status,
            o.payment_id,
            o.created_at,
            COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id, o.total_amount, o.status, o.payment_id, o.created_at
        ORDER BY o.created_at DESC`,
        [id]
    );

    res.status(200).json({
        success: true,
        message: "User orders fetched successfully",
        orders,
        count: orders.length
    });
});

// PUT /admin/users/:id/block - Block/unblock user
export const handleBlockUser = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { is_blocked } = req.body;

    // Check if user exists
    const users = await queryDb<User[]>(
        "SELECT id FROM users WHERE id = ?",
        [id]
    );

    if (users.length === 0) {
        return next(new CustomError("User not found", 404));
    }

    // Check if is_blocked column exists, if not, add it
    try {
        await queryDb<ResultSetHeader>(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE"
        );
    } catch (error) {
        // Column might already exist, continue
    }

    // Update user blocked status
    const result = await queryDb<ResultSetHeader>(
        "UPDATE users SET is_blocked = ? WHERE id = ?",
        [is_blocked, id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update user status", 500));
    }

    res.status(200).json({
        success: true,
        message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully`,
        user: {
            id: Number(id),
            is_blocked
        }
    });
});
