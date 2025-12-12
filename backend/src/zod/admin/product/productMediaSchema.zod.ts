import { z } from "zod";

export const addProductMediaSchema = z.object({
  url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  is_primary: z.boolean().default(false)
});

export const productMediaIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid media ID").transform(Number)
});

export const productIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid product ID").transform(Number)
});
