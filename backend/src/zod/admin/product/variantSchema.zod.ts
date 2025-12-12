import { z } from "zod";

// Schema for creating a variant
export const createVariantSchema = z.object({
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    message: "Size must be one of: XS, S, M, L, XL, XXL"
  }).optional().nullable(),
  color: z.string().min(1, "Color cannot be empty").max(50, "Color is too long").optional().nullable(),
  stock: z.number().int("Stock must be an integer").min(0, "Stock cannot be negative").default(0),
  additional_price: z.number().min(0, "Additional price cannot be negative").default(0)
});

// Schema for updating a variant
export const updateVariantSchema = z.object({
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    message: "Size must be one of: XS, S, M, L, XL, XXL"
  }).optional().nullable(),
  color: z.string().min(1, "Color cannot be empty").max(50, "Color is too long").optional().nullable(),
  stock: z.number().int("Stock must be an integer").min(0, "Stock cannot be negative").optional(),
  additional_price: z.number().min(0, "Additional price cannot be negative").optional()
}).refine((data) => {
  return data.size !== undefined || data.color !== undefined || data.stock !== undefined || data.additional_price !== undefined;
}, {
  message: "At least one field must be provided"
});

// Schema for updating stock only
export const updateStockSchema = z.object({
  stock: z.number().int("Stock must be an integer").min(0, "Stock cannot be negative")
});

// Schema for variant ID parameter
export const variantIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid variant ID").transform(Number)
});
