import express from "express";
import {
    handleGetAllUsers,
    handleGetUserDetails,
    handleGetUserOrders,
    handleBlockUser
} from "../../../controller/admin/user.admin.controller.js";
import { adminAuthMiddleware } from "../../../middlewares/adminAuth.middleware.js";
import { zodValidate } from "../../../middlewares/zodValidate.middleware.js";
import {
    userIdSchema,
    blockUserSchema
} from "../../../zod/admin/user/userSchema.zod.js";

const router = express.Router();

// All admin user routes require admin authentication
router.use(adminAuthMiddleware);

// GET /admin/users - Get all users (with optional filters)
router.get("/", handleGetAllUsers);

// GET /admin/users/:id - Get user details
router.get("/:id",
    zodValidate(userIdSchema, "params"),
    handleGetUserDetails
);

// GET /admin/users/:id/orders - Get user orders
router.get("/:id/orders",
    zodValidate(userIdSchema, "params"),
    handleGetUserOrders
);

// PUT /admin/users/:id/block - Block/unblock user
router.put("/:id/block",
    zodValidate(userIdSchema, "params"),
    zodValidate(blockUserSchema, "body"),
    handleBlockUser
);

export default router;
