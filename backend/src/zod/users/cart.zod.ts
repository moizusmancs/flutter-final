import { z } from 'zod';

// Schema for adding item to cart
export const addToCartSchema = z.object({
    variant_id: z.number().int().positive("Variant ID must be a positive integer"),
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum quantity is 10")
});

// Schema for updating cart item quantity
export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum quantity is 10")
});

// Schema for cart item ID parameter
export const cartIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid cart item ID").transform(Number)
});
