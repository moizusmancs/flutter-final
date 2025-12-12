import { z } from "zod";

export const updateProductSchema = z.object({
  productId: z.number("Product ID is required")
    .int("Product ID must be an integer")
    .positive("Product ID must be a positive integer"),

  name: z.string().min(3, "Product name must be at least 3 characters long").optional().nullable(),
  description: z.string().min(10, "Product description must be at least 10 characters long").optional().nullable(),
  price: z.number().min(0, "Price must be >= 0").optional().nullable(),
  categoryId: z.number().int("Category ID must be an integer").positive("Category ID must be a positive integer").optional().nullable(),
  discount: z.number().min(0, "Discount must be >= 0").max(70, "Discount cannot exceed 70%").optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const productIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid product ID").transform(Number)
});

export const updateProductStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"], {
    message: "Status must be one of: draft, published, archived"
  })
});
