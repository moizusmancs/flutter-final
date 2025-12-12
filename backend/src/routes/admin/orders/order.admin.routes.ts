import express from "express";
import {
    handleGetAllOrders,
    handleGetOrderDetails,
    handleUpdateOrderStatus,
    handleGetOrderStatistics
} from "../../../controller/admin/order.admin.controller.js";
import { adminAuthMiddleware } from "../../../middlewares/adminAuth.middleware.js";
import { zodValidate } from "../../../middlewares/zodValidate.middleware.js";
import {
    orderIdSchema,
    updateOrderStatusSchema
} from "../../../zod/admin/order/orderSchema.zod.js";

const router = express.Router();

// All admin order routes require admin authentication
router.use(adminAuthMiddleware);

// GET /admin/orders/stats - Get order statistics (must be before /:id route)
router.get("/stats", handleGetOrderStatistics);

// GET /admin/orders - Get all orders (with optional filters)
router.get("/", handleGetAllOrders);

// GET /admin/orders/:id - Get order details
router.get("/:id",
    zodValidate(orderIdSchema, "params"),
    handleGetOrderDetails
);

// PUT /admin/orders/:id/status - Update order status
router.put("/:id/status",
    zodValidate(orderIdSchema, "params"),
    zodValidate(updateOrderStatusSchema, "body"),
    handleUpdateOrderStatus
);

export default router;
