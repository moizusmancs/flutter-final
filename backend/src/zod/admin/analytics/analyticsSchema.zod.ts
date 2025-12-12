import { z } from "zod";

export const revenueQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"], {
    message: "Period must be one of: day, week, month, year"
  }).optional().default("month"),
  start_date: z.string()
    .datetime("Invalid datetime format")
    .optional(),
  end_date: z.string()
    .datetime("Invalid datetime format")
    .optional()
});

export const topProductsQuerySchema = z.object({
  limit: z.preprocess(
    (val) => val ?? "10",
    z.string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .refine(val => val > 0 && val <= 100, "Limit must be between 1 and 100")
  ),
  period: z.enum(["7days", "30days", "90days", "all"], {
    message: "Period must be one of: 7days, 30days, 90days, all"
  }).optional().default("30days")
});

export const recentOrdersQuerySchema = z.object({
  limit: z.preprocess(
    (val) => val ?? "20",
    z.string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .refine(val => val > 0 && val <= 100, "Limit must be between 1 and 100")
  ),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"], {
    message: "Status must be one of: pending, paid, shipped, delivered, cancelled"
  }).optional()
});
