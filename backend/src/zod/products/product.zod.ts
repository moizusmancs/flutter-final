import { z } from 'zod';

// Schema for product ID parameter
export const productIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid product ID").transform(Number)
});

// Schema for category ID parameter
export const categoryIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid category ID").transform(Number)
});

// Schema for search query
export const searchProductSchema = z.object({
    q: z.string().min(1, "Search query is required"),
    category_id: z.string().optional().transform((val) => val ? Number(val) : undefined),
    min_price: z.string().optional().transform((val) => val ? Number(val) : undefined),
    max_price: z.string().optional().transform((val) => val ? Number(val) : undefined),
    page: z.string().optional().default("1").transform(Number),
    limit: z.string().optional().default("10").transform(Number)
});

// Schema for getting all products with filters
export const getAllProductsSchema = z.object({
    page: z.string().optional().default("1").transform(Number),
    limit: z.string().optional().default("10").transform(Number),
    sort: z.enum(["asc", "desc"]).optional().default("desc"),
    category_id: z.string().optional().transform((val) => val ? Number(val) : undefined),
    min_price: z.string().optional().transform((val) => val ? Number(val) : undefined),
    max_price: z.string().optional().transform((val) => val ? Number(val) : undefined)
});
