import { z } from 'zod';

// Schema for creating a new order
export const createOrderSchema = z.object({
    shipping_address_id: z.number().int().positive("Shipping address ID must be a positive integer"),
    payment_method: z.enum(['card', 'cod', 'upi', 'net_banking'], {
        message: "Invalid payment method"
    })
});

// Schema for order ID parameter
export const orderIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid order ID").transform(Number)
});
