import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string("Name must be a string")
    .min(3, "Name must be at least 3 characters long"),

  parent_id: z
    .number("Parent ID must be a number")
    .int("Parent ID must be an integer")
    .nullable()
    .optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string("Name must be a string")
    .min(3, "Name must be at least 3 characters long")
    .optional(),

  parent_id: z
    .number("Parent ID must be a number")
    .int("Parent ID must be an integer")
    .nullable()
    .optional(),
}).refine((data) => data.name !== undefined || data.parent_id !== undefined, {
  message: "At least one field must be provided"
});

export const categoryIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid category ID").transform(Number)
});
