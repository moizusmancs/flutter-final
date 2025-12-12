import { z } from "zod";

export const orderIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid order ID").transform(Number)
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"], {
    message: "Status must be one of: pending, paid, shipped, delivered, cancelled"
  })
});
