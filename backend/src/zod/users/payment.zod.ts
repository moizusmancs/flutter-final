import { z } from 'zod';

// Schema for initiating payment
export const initiatePaymentSchema = z.object({
    order_id: z.number().int().positive("Order ID must be a positive integer"),
    payment_method: z.enum(['card', 'cod', 'upi', 'net_banking'], {
        message: "Invalid payment method"
    })
});

// Schema for verifying payment
export const verifyPaymentSchema = z.object({
    payment_intent_id: z.string().min(1, "Payment intent ID is required"),
    order_id: z.number().int().positive("Order ID must be a positive integer")
});

// Schema for payment order ID parameter
export const paymentOrderIdSchema = z.object({
    order_id: z.string().regex(/^\d+$/, "Invalid order ID").transform(Number)
});
