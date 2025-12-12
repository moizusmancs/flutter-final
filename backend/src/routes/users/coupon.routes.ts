import { Router } from 'express';
import {
    handleValidateCoupon,
    handleGetActiveCoupons
} from '../../controller/users/coupon.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { zodValidate } from '../../middlewares/zodValidate.middleware.js';
import { validateCouponSchema } from '../../zod/users/coupon.zod.js';

const router = Router();

// POST /coupons/validate - Validate coupon (requires auth)
router.post('/validate',
    authMiddleware,
    zodValidate(validateCouponSchema, 'body'),
    handleValidateCoupon
);

// GET /coupons/active - Get active coupons (public)
router.get('/active', handleGetActiveCoupons);

export default router;
