import { NextFunction, Request, Response } from "express";
import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import { ResultSetHeader } from "mysql2";
import { Coupon } from "../../types/coupon.js";
import CustomError from "../../utils/customError.js";

// GET /admin/coupons - Get all coupons
export const handleGetAllCoupons = AsyncCall(async (_req, res, _next) => {
    const coupons = await queryDb<Coupon[]>(
        `SELECT
            id,
            code,
            discount_percent,
            min_order_amount,
            expires_at
        FROM coupons
        ORDER BY created_at DESC`
    );

    // Add status for each coupon (active/expired)
    const couponsWithStatus = coupons.map(coupon => ({
        ...coupon,
        is_active: coupon.expires_at ? new Date(coupon.expires_at) > new Date() : true,
        is_expired: coupon.expires_at ? new Date(coupon.expires_at) <= new Date() : false
    }));

    res.status(200).json({
        success: true,
        message: "Coupons fetched successfully",
        coupons: couponsWithStatus,
        count: coupons.length
    });
});

// POST /admin/coupons - Create coupon
export const handleCreateCoupon = AsyncCall(async (req, res, next) => {
    const { code, discount_percent, min_order_amount, expires_at } = req.body;

    // Check if coupon code already exists
    const existing = await queryDb<Coupon[]>(
        "SELECT id FROM coupons WHERE code = ?",
        [code]
    );

    if (existing.length > 0) {
        return next(new CustomError("Coupon code already exists", 400));
    }

    // Insert coupon
    const result = await queryDb<ResultSetHeader>(
        "INSERT INTO coupons (code, discount_percent, min_order_amount, expires_at) VALUES (?, ?, ?, ?)",
        [code, discount_percent, min_order_amount || null, expires_at || null]
    );

    if (!result || !result.insertId) {
        return next(new CustomError("Failed to create coupon", 500));
    }

    res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        coupon: {
            id: result.insertId,
            code,
            discount_percent,
            min_order_amount: min_order_amount || null,
            expires_at: expires_at || null
        }
    });
});

// PUT /admin/coupons/:id - Update coupon
export const handleUpdateCoupon = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { code, discount_percent, min_order_amount, expires_at } = req.body;

    // Check if coupon exists
    const coupons = await queryDb<Coupon[]>(
        "SELECT id FROM coupons WHERE id = ?",
        [id]
    );

    if (coupons.length === 0) {
        return next(new CustomError("Coupon not found", 404));
    }

    // If code is being updated, check for duplicates
    if (code) {
        const existing = await queryDb<Coupon[]>(
            "SELECT id FROM coupons WHERE code = ? AND id != ?",
            [code, id]
        );

        if (existing.length > 0) {
            return next(new CustomError("Coupon code already exists", 400));
        }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (code !== undefined) {
        updates.push("code = ?");
        values.push(code);
    }

    if (discount_percent !== undefined) {
        updates.push("discount_percent = ?");
        values.push(discount_percent);
    }

    if (min_order_amount !== undefined) {
        updates.push("min_order_amount = ?");
        values.push(min_order_amount);
    }

    if (expires_at !== undefined) {
        updates.push("expires_at = ?");
        values.push(expires_at);
    }

    values.push(id);

    // Update coupon
    const result = await queryDb<ResultSetHeader>(
        `UPDATE coupons SET ${updates.join(", ")} WHERE id = ?`,
        values
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update coupon", 500));
    }

    // Get updated coupon
    const updated = await queryDb<Coupon[]>(
        "SELECT id, code, discount_percent, min_order_amount, expires_at FROM coupons WHERE id = ?",
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Coupon updated successfully",
        coupon: updated[0]
    });
});

// DELETE /admin/coupons/:id - Delete coupon
export const handleDeleteCoupon = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if coupon exists
    const coupons = await queryDb<Coupon[]>(
        "SELECT id FROM coupons WHERE id = ?",
        [id]
    );

    if (coupons.length === 0) {
        return next(new CustomError("Coupon not found", 404));
    }

    // Check if coupon has been used
    const usage = await queryDb<any[]>(
        "SELECT id FROM order_coupons WHERE coupon_id = ?",
        [id]
    );

    if (usage.length > 0) {
        return next(new CustomError("Cannot delete coupon that has been used in orders", 400));
    }

    // Delete coupon
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM coupons WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to delete coupon", 500));
    }

    res.status(200).json({
        success: true,
        message: "Coupon deleted successfully"
    });
});

// GET /admin/coupons/:id/usage - Get usage stats
export const handleGetCouponUsageStats = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if coupon exists
    const coupons = await queryDb<Coupon[]>(
        "SELECT id, code, discount_percent, min_order_amount, expires_at FROM coupons WHERE id = ?",
        [id]
    );

    if (coupons.length === 0) {
        return next(new CustomError("Coupon not found", 404));
    }

    // Get usage statistics
    const usageStats = await queryDb<any[]>(
        `SELECT
            COUNT(*) as total_uses,
            SUM(oc.discount_applied) as total_discount_given,
            AVG(oc.discount_applied) as average_discount,
            MIN(o.created_at) as first_used_at,
            MAX(o.created_at) as last_used_at
        FROM order_coupons oc
        JOIN orders o ON oc.order_id = o.id
        WHERE oc.coupon_id = ?`,
        [id]
    );

    // Get orders that used this coupon
    const orders = await queryDb<any[]>(
        `SELECT
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at,
            oc.discount_applied,
            u.email as user_email
        FROM order_coupons oc
        JOIN orders o ON oc.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE oc.coupon_id = ?
        ORDER BY o.created_at DESC
        LIMIT 50`,
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Coupon usage stats fetched successfully",
        coupon: coupons[0],
        stats: {
            total_uses: usageStats[0].total_uses || 0,
            total_discount_given: usageStats[0].total_discount_given || 0,
            average_discount: usageStats[0].average_discount || 0,
            first_used_at: usageStats[0].first_used_at,
            last_used_at: usageStats[0].last_used_at
        },
        recent_orders: orders
    });
});
