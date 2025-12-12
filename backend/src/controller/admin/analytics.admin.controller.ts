import { Request, Response, NextFunction } from "express";
import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";

// GET /admin/analytics/stats - Get overall statistics
export const handleGetOverallStats = AsyncCall(async (_req: Request, res: Response, _next: NextFunction) => {
    // Get total orders and revenue
    const orderStats = await queryDb<any[]>(
        `SELECT
            COUNT(*) as total_orders,
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_revenue,
            COALESCE(AVG(CASE WHEN status != 'cancelled' THEN total_amount ELSE NULL END), 0) as average_order_value,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
            COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
            COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
            COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM orders`
    );

    // Get total users
    const userStats = await queryDb<any[]>(
        `SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_last_30_days
        FROM users`
    );

    // Get total products and categories
    const productStats = await queryDb<any[]>(
        `SELECT
            (SELECT COUNT(*) FROM products) as total_products,
            (SELECT COUNT(*) FROM products) as active_products,
            (SELECT COUNT(*) FROM categories) as total_categories,
            (SELECT COUNT(*) FROM product_variants) as total_variants
        `
    );

    // Get revenue trends (last 30 days vs previous 30 days)
    const revenueTrends = await queryDb<any[]>(
        `SELECT
            COALESCE(SUM(CASE
                WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status != 'cancelled'
                THEN total_amount ELSE 0
            END), 0) as revenue_last_30_days,
            COALESCE(SUM(CASE
                WHEN created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
                AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
                AND status != 'cancelled'
                THEN total_amount ELSE 0
            END), 0) as revenue_previous_30_days,
            COUNT(CASE
                WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                THEN 1
            END) as orders_last_30_days,
            COUNT(CASE
                WHEN created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
                AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
                THEN 1
            END) as orders_previous_30_days
        FROM orders`
    );

    // Calculate growth percentages
    const revenueGrowth = revenueTrends[0].revenue_previous_30_days > 0
        ? ((revenueTrends[0].revenue_last_30_days - revenueTrends[0].revenue_previous_30_days) / revenueTrends[0].revenue_previous_30_days * 100)
        : 0;

    const ordersGrowth = revenueTrends[0].orders_previous_30_days > 0
        ? ((revenueTrends[0].orders_last_30_days - revenueTrends[0].orders_previous_30_days) / revenueTrends[0].orders_previous_30_days * 100)
        : 0;

    res.status(200).json({
        success: true,
        message: "Overall statistics fetched successfully",
        stats: {
            orders: {
                total: orderStats[0].total_orders,
                pending: orderStats[0].pending_orders,
                paid: orderStats[0].paid_orders,
                shipped: orderStats[0].shipped_orders,
                delivered: orderStats[0].delivered_orders,
                cancelled: orderStats[0].cancelled_orders
            },
            revenue: {
                total: orderStats[0].total_revenue,
                average_order_value: orderStats[0].average_order_value,
                last_30_days: revenueTrends[0].revenue_last_30_days,
                previous_30_days: revenueTrends[0].revenue_previous_30_days,
                growth_percentage: parseFloat(revenueGrowth.toFixed(2))
            },
            orders_trend: {
                last_30_days: revenueTrends[0].orders_last_30_days,
                previous_30_days: revenueTrends[0].orders_previous_30_days,
                growth_percentage: parseFloat(ordersGrowth.toFixed(2))
            },
            users: {
                total: userStats[0].total_users,
                new_last_30_days: userStats[0].new_users_last_30_days
            },
            products: {
                total: productStats[0].total_products,
                active: productStats[0].active_products,
                categories: productStats[0].total_categories,
                variants: productStats[0].total_variants
            }
        }
    });
});

// GET /admin/analytics/revenue - Get revenue over time
export const handleGetRevenueOverTime = AsyncCall(async (req: Request, res: Response, _next: NextFunction) => {
    const { period, start_date, end_date } = req.query as {
        period?: "day" | "week" | "month" | "year";
        start_date?: string;
        end_date?: string;
    };

    const periodFormat = period || "month";

    // Determine date format and interval based on period
    let dateFormat: string;
    let dateInterval: string;

    switch (periodFormat) {
        case "day":
            dateFormat = "%Y-%m-%d";
            dateInterval = "1 DAY";
            break;
        case "week":
            dateFormat = "%Y-%u"; // Year-Week
            dateInterval = "1 WEEK";
            break;
        case "month":
            dateFormat = "%Y-%m";
            dateInterval = "1 MONTH";
            break;
        case "year":
            dateFormat = "%Y";
            dateInterval = "1 YEAR";
            break;
        default:
            dateFormat = "%Y-%m";
            dateInterval = "1 MONTH";
    }

    // Build date filter
    let dateFilter = "";
    const params: any[] = [];

    if (start_date && end_date) {
        dateFilter = "WHERE created_at >= ? AND created_at <= ?";
        params.push(start_date, end_date);
    } else if (start_date) {
        dateFilter = "WHERE created_at >= ?";
        params.push(start_date);
    } else if (end_date) {
        dateFilter = "WHERE created_at <= ?";
        params.push(end_date);
    } else {
        // Default to last 12 periods
        dateFilter = `WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 ${dateInterval})`;
    }

    const revenueData = await queryDb<any[]>(
        `SELECT
            DATE_FORMAT(created_at, ?) as period,
            COUNT(*) as total_orders,
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as revenue,
            COALESCE(AVG(CASE WHEN status != 'cancelled' THEN total_amount ELSE NULL END), 0) as average_order_value,
            COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM orders
        ${dateFilter}
        GROUP BY period
        ORDER BY period ASC`,
        [dateFormat, ...params]
    );

    res.status(200).json({
        success: true,
        message: "Revenue data fetched successfully",
        period: periodFormat,
        data: revenueData
    });
});

// GET /admin/analytics/top-products - Get best selling products
export const handleGetTopProducts = AsyncCall(async (req: Request, res: Response, _next: NextFunction) => {
    const { limit, period } = req.query as {
        limit?: number;
        period?: "7days" | "30days" | "90days" | "all";
    };

    const resultLimit = limit || 10;
    const timePeriod = period || "30days";

    // Build date filter
    let dateFilter = "";

    switch (timePeriod) {
        case "7days":
            dateFilter = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            break;
        case "30days":
            dateFilter = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            break;
        case "90days":
            dateFilter = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
            break;
        case "all":
            dateFilter = "";
            break;
    }

    const topProducts = await queryDb<any[]>(
        `SELECT
            p.id,
            p.name,
            p.slug,
            COUNT(DISTINCT oi.order_id) as order_count,
            SUM(oi.quantity) as total_quantity_sold,
            COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue,
            COALESCE(AVG(oi.price_at_purchase), 0) as average_price,
            (SELECT url FROM product_media WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url
        FROM order_items oi
        JOIN product_variants pv ON oi.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled' ${dateFilter}
        GROUP BY p.id, p.name, p.slug
        ORDER BY total_quantity_sold DESC
        LIMIT ?`,
        [resultLimit]
    );

    res.status(200).json({
        success: true,
        message: "Top products fetched successfully",
        period: timePeriod,
        limit: resultLimit,
        products: topProducts
    });
});

// GET /admin/analytics/recent-orders - Get recent orders
export const handleGetRecentOrders = AsyncCall(async (req: Request, res: Response, _next: NextFunction) => {
    const { limit, status } = req.query as {
        limit?: number;
        status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    };

    const resultLimit = limit || 20;

    // Build status filter
    let statusFilter = "";
    const params: any[] = [];

    if (status) {
        statusFilter = "WHERE o.status = ?";
        params.push(status);
    }

    const recentOrders = await queryDb<any[]>(
        `SELECT
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            p.method as payment_method,
            o.created_at,
            u.fullname as user_name,
            u.email as user_email,
            COUNT(oi.id) as item_count,
            (SELECT url FROM product_media pm
             JOIN product_variants pv ON pm.product_id = pv.product_id
             JOIN order_items oi2 ON oi2.variant_id = pv.id
             WHERE oi2.order_id = o.id AND pm.is_primary = TRUE
             LIMIT 1) as first_product_image
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN payments p ON o.payment_id = p.id
        ${statusFilter}
        GROUP BY o.id, o.user_id, o.total_amount, o.status, p.method, o.created_at, u.fullname, u.email
        ORDER BY o.created_at DESC
        LIMIT ?`,
        [...params, resultLimit]
    );

    res.status(200).json({
        success: true,
        message: "Recent orders fetched successfully",
        status: status || "all",
        limit: resultLimit,
        orders: recentOrders
    });
});
