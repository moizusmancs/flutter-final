import { z } from 'zod';

// Schema for adding item to wishlist
export const addToWishlistSchema = z.object({
    variant_id: z.number().int().positive("Variant ID must be a positive integer")
});

// Schema for wishlist item ID parameter
export const wishlistIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid wishlist item ID").transform(Number)
});
