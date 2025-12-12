import { z } from 'zod';

// Schema for validating a coupon
export const validateCouponSchema = z.object({
    code: z.string().min(1, "Coupon code is required").toUpperCase(),
    order_amount: z.number().positive("Order amount must be positive")
});
