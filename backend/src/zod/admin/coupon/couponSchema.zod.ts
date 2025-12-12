import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string()
    .min(3, "Coupon code must be at least 3 characters long")
    .max(50, "Coupon code must not exceed 50 characters")
    .toUpperCase(),
  discount_percent: z.number()
    .int("Discount percent must be an integer")
    .min(1, "Discount percent must be at least 1")
    .max(100, "Discount percent cannot exceed 100"),
  min_order_amount: z.number()
    .min(0, "Minimum order amount must be >= 0")
    .optional()
    .nullable(),
  expires_at: z.string()
    .datetime("Invalid datetime format")
    .optional()
    .nullable()
});

export const updateCouponSchema = z.object({
  code: z.string()
    .min(3, "Coupon code must be at least 3 characters long")
    .max(50, "Coupon code must not exceed 50 characters")
    .toUpperCase()
    .optional(),
  discount_percent: z.number()
    .int("Discount percent must be an integer")
    .min(1, "Discount percent must be at least 1")
    .max(100, "Discount percent cannot exceed 100")
    .optional(),
  min_order_amount: z.number()
    .min(0, "Minimum order amount must be >= 0")
    .optional()
    .nullable(),
  expires_at: z.string()
    .datetime("Invalid datetime format")
    .optional()
    .nullable()
}).refine((data) => {
  return data.code !== undefined || data.discount_percent !== undefined ||
         data.min_order_amount !== undefined || data.expires_at !== undefined;
}, {
  message: "At least one field must be provided"
});

export const couponIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid coupon ID").transform(Number)
});
