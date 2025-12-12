import express from "express";
import {
    handleGetAllCoupons,
    handleCreateCoupon,
    handleUpdateCoupon,
    handleDeleteCoupon,
    handleGetCouponUsageStats
} from "../../../controller/admin/coupon.admin.controller.js";
import { adminAuthMiddleware } from "../../../middlewares/adminAuth.middleware.js";
import { zodValidate } from "../../../middlewares/zodValidate.middleware.js";
import {
    createCouponSchema,
    updateCouponSchema,
    couponIdSchema
} from "../../../zod/admin/coupon/couponSchema.zod.js";

const router = express.Router();

// All admin coupon routes require admin authentication
router.use(adminAuthMiddleware);

// GET /admin/coupons - Get all coupons
router.get("/", handleGetAllCoupons);

// POST /admin/coupons - Create coupon
router.post("/",
    zodValidate(createCouponSchema, "body"),
    handleCreateCoupon
);

// GET /admin/coupons/:id/usage - Get usage stats (must be before /:id route)
router.get("/:id/usage",
    zodValidate(couponIdSchema, "params"),
    handleGetCouponUsageStats
);

// PUT /admin/coupons/:id - Update coupon
router.put("/:id",
    zodValidate(couponIdSchema, "params"),
    zodValidate(updateCouponSchema, "body"),
    handleUpdateCoupon
);

// DELETE /admin/coupons/:id - Delete coupon
router.delete("/:id",
    zodValidate(couponIdSchema, "params"),
    handleDeleteCoupon
);

export default router;
