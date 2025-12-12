import { z } from 'zod';

// Schema for category ID parameter
export const categoryIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid category ID").transform(Number)
});

// Schema for pagination in category products
export const categoryProductsSchema = z.object({
    page: z.string().optional().default("1").transform(Number),
    limit: z.string().optional().default("10").transform(Number),
    sort: z.enum(["asc", "desc"]).optional().default("desc")
});
