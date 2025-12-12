import { NextFunction, Request, Response } from "express";
import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import { ResultSetHeader } from "mysql2";
import { Order, OrderItem } from "../../types/order.js";
import CustomError from "../../utils/customError.js";

// GET /admin/orders - Get all orders
export const handleGetAllOrders = AsyncCall(async (req, res, _next) => {
    const { status, user_id } = req.query;

    let query = `
        SELECT
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            o.payment_id,
            o.shipping_address_id,
            o.created_at,
            u.email as user_email,
            u.full_name as user_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (status) {
        conditions.push("o.status = ?");
        values.push(status);
    }

    if (user_id) {
        conditions.push("o.user_id = ?");
        values.push(Number(user_id));
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY o.created_at DESC";

    const orders = await queryDb<any[]>(query, values);

    res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        orders,
        count: orders.length
    });
});

// GET /admin/orders/:id - Get order details
export const handleGetOrderDetails = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Get order details
    const orders = await queryDb<any[]>(
        `SELECT
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            o.payment_id,
            o.shipping_address_id,
            o.created_at,
            u.email as user_email,
            u.full_name as user_name,
            u.phone as user_phone,
            a.address_line1,
            a.address_line2,
            a.city,
            a.state,
            a.postal_code,
            a.country
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON o.shipping_address_id = a.id
        WHERE o.id = ?`,
        [id]
    );

    if (orders.length === 0) {
        return next(new CustomError("Order not found", 404));
    }

    // Get order items with product details
    const items = await queryDb<any[]>(
        `SELECT
            oi.id,
            oi.order_id,
            oi.variant_id,
            oi.quantity,
            oi.price_at_purchase,
            pv.size,
            pv.color,
            p.id as product_id,
            p.name as product_name,
            pm.url as product_image
        FROM order_items oi
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        LEFT JOIN products p ON pv.product_id = p.id
        LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = TRUE
        WHERE oi.order_id = ?`,
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Order details fetched successfully",
        order: {
            ...orders[0],
            items
        }
    });
});

// PUT /admin/orders/:id/status - Update order status
export const handleUpdateOrderStatus = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    // Check if order exists
    const orders = await queryDb<Order[]>(
        "SELECT id, status FROM orders WHERE id = ?",
        [id]
    );

    if (orders.length === 0) {
        return next(new CustomError("Order not found", 404));
    }

    const currentStatus = orders[0].status;

    // Validate status transitions
    if (currentStatus === "cancelled") {
        return next(new CustomError("Cannot update status of a cancelled order", 400));
    }

    if (currentStatus === "delivered" && status !== "cancelled") {
        return next(new CustomError("Cannot change status of a delivered order", 400));
    }

    // Update order status
    const result = await queryDb<ResultSetHeader>(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update order status", 500));
    }

    res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        order: {
            id: Number(id),
            status
        }
    });
});

// GET /admin/orders/stats - Get order statistics
export const handleGetOrderStatistics = AsyncCall(async (_req, res, _next) => {
    // Get total orders count by status
    const statusCounts = await queryDb<any[]>(
        `SELECT
            status,
            COUNT(*) as count,
            SUM(total_amount) as total_revenue
        FROM orders
        GROUP BY status`
    );

    // Get overall statistics
    const overallStats = await queryDb<any[]>(
        `SELECT
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as average_order_value
        FROM orders`
    );

    // Get recent orders count (last 30 days)
    const recentStats = await queryDb<any[]>(
        `SELECT
            COUNT(*) as orders_last_30_days,
            SUM(total_amount) as revenue_last_30_days
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    // Get top products by order count
    const topProducts = await queryDb<any[]>(
        `SELECT
            p.id,
            p.name,
            COUNT(DISTINCT oi.order_id) as order_count,
            SUM(oi.quantity) as total_quantity_sold,
            SUM(oi.quantity * oi.price_at_purchase) as total_revenue
        FROM order_items oi
        JOIN product_variants pv ON oi.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY order_count DESC
        LIMIT 10`
    );

    res.status(200).json({
        success: true,
        message: "Order statistics fetched successfully",
        statistics: {
            overall: overallStats[0],
            recent: recentStats[0],
            by_status: statusCounts,
            top_products: topProducts
        }
    });
});
