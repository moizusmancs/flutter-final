import { z } from "zod";

export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid user ID").transform(Number)
});

export const blockUserSchema = z.object({
  is_blocked: z.boolean()
});
