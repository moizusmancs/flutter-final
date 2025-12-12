// src/schemas/product.schema.ts
import { z } from "zod";

export const getAllProductsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val > 0 && val <= 50, "Limit must be between 1–100"),
  sort: z
    .enum(["recommended", "price_low", "price_high", "top_rating"])
    .optional()
    .default("recommended"),
});
