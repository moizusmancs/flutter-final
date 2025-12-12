import express from "express";
import {
    handleGetOverallStats,
    handleGetRevenueOverTime,
    handleGetTopProducts,
    handleGetRecentOrders
} from "../../../controller/admin/analytics.admin.controller.js";
import { adminAuthMiddleware } from "../../../middlewares/adminAuth.middleware.js";
import { zodValidate } from "../../../middlewares/zodValidate.middleware.js";
import {
    revenueQuerySchema,
    topProductsQuerySchema,
    recentOrdersQuerySchema
} from "../../../zod/admin/analytics/analyticsSchema.zod.js";

const router = express.Router();

// All admin analytics routes require admin authentication
router.use(adminAuthMiddleware);

// GET /admin/analytics/stats - Get overall statistics
router.get("/stats", handleGetOverallStats);

// GET /admin/analytics/revenue - Get revenue over time
router.get("/revenue",
    zodValidate(revenueQuerySchema, "query"),
    handleGetRevenueOverTime
);

// GET /admin/analytics/top-products - Get best selling products
router.get("/top-products",
    zodValidate(topProductsQuerySchema, "query"),
    handleGetTopProducts
);

// GET /admin/analytics/recent-orders - Get recent orders
router.get("/recent-orders",
    zodValidate(recentOrdersQuerySchema, "query"),
    handleGetRecentOrders
);

export default router;
