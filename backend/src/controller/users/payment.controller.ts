import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { Payment } from "../../types/payment.js";
import { Order } from "../../types/order.js";
import { ResultSetHeader } from "mysql2";
import Stripe from "stripe";

// Lazy initialization of Stripe
function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        return null;
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });
}

// POST /payments/initiate - Initiate payment
export const handleInitiatePayment = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { order_id, payment_method } = req.body;

    // Verify order exists and belongs to user
    const orders = await queryDb<Order[]>(
        "SELECT id, total_amount, status, payment_id FROM orders WHERE id = ? AND user_id = ?",
        [order_id, userId]
    );

    if (orders.length === 0) {
        return next(new CustomError("Order not found", 404));
    }

    const order = orders[0];

    // Check if order is already paid
    if (order.status === 'paid') {
        return next(new CustomError("Order is already paid", 400));
    }

    // Check if order is cancelled
    if (order.status === 'cancelled') {
        return next(new CustomError("Cannot pay for cancelled order", 400));
    }

    // For Cash on Delivery, no payment processing needed
    if (payment_method === 'cod') {
        // Update payment method if payment record exists
        if (order.payment_id) {
            await queryDb(
                "UPDATE payments SET method = 'cod', status = 'pending' WHERE id = ?",
                [order.payment_id]
            );
        } else {
            // Create payment record
            const paymentResult = await queryDb<ResultSetHeader>(
                "INSERT INTO payments (order_id, method, status) VALUES (?, 'cod', 'pending')",
                [order_id]
            );

            if (paymentResult && paymentResult.insertId) {
                await queryDb(
                    "UPDATE orders SET payment_id = ? WHERE id = ?",
                    [paymentResult.insertId, order_id]
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Order confirmed with Cash on Delivery",
            payment: {
                order_id,
                method: 'cod',
                status: 'pending'
            }
        });
    }

    // For card payments, use Stripe
    if (payment_method === 'card') {
        const stripe = getStripe();
        if (!stripe) {
            return next(new CustomError("Payment processing is not configured. Please add STRIPE_SECRET_KEY to environment variables.", 503));
        }

        try {
            // Create Stripe payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(order.total_amount * 100), // Convert to cents
                currency: 'usd',
                metadata: {
                    order_id: order_id.toString(),
                    user_id: userId.toString()
                },
                automatic_payment_methods: {
                    enabled: true
                }
            });

            // Update or create payment record with transaction reference
            if (order.payment_id) {
                await queryDb(
                    "UPDATE payments SET method = 'card', status = 'pending', transaction_reference = ? WHERE id = ?",
                    [paymentIntent.id, order.payment_id]
                );
            } else {
                const paymentResult = await queryDb<ResultSetHeader>(
                    "INSERT INTO payments (order_id, method, status, transaction_reference) VALUES (?, 'card', 'pending', ?)",
                    [order_id, paymentIntent.id]
                );

                if (paymentResult && paymentResult.insertId) {
                    await queryDb(
                        "UPDATE orders SET payment_id = ? WHERE id = ?",
                        [paymentResult.insertId, order_id]
                    );
                }
            }

            return res.status(200).json({
                success: true,
                message: "Payment intent created successfully",
                payment: {
                    order_id,
                    method: 'card',
                    status: 'pending',
                    client_secret: paymentIntent.client_secret,
                    payment_intent_id: paymentIntent.id
                }
            });
        } catch (error: any) {
            return next(new CustomError(`Payment initiation failed: ${error.message}`, 500));
        }
    }

    // For other payment methods (UPI, Net Banking)
    // In a real application, you would integrate with respective payment gateways
    if (order.payment_id) {
        await queryDb(
            "UPDATE payments SET method = ?, status = 'pending' WHERE id = ?",
            [payment_method, order.payment_id]
        );
    } else {
        const paymentResult = await queryDb<ResultSetHeader>(
            "INSERT INTO payments (order_id, method, status) VALUES (?, ?, 'pending')",
            [order_id, payment_method]
        );

        if (paymentResult && paymentResult.insertId) {
            await queryDb(
                "UPDATE orders SET payment_id = ? WHERE id = ?",
                [paymentResult.insertId, order_id]
            );
        }
    }

    res.status(200).json({
        success: true,
        message: `Payment initiated with ${payment_method}`,
        payment: {
            order_id,
            method: payment_method,
            status: 'pending',
            note: 'Integration with payment gateway pending'
        }
    });
});

// POST /payments/verify - Verify payment (for Stripe card payments)
export const handleVerifyPayment = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { payment_intent_id, order_id } = req.body;

    // Verify order exists and belongs to user
    const orders = await queryDb<Order[]>(
        "SELECT id, status FROM orders WHERE id = ? AND user_id = ?",
        [order_id, userId]
    );

    if (orders.length === 0) {
        return next(new CustomError("Order not found", 404));
    }

    const stripe = getStripe();
    if (!stripe) {
        return next(new CustomError("Payment processing is not configured. Please add STRIPE_SECRET_KEY to environment variables.", 503));
    }

    try {
        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        // Check if payment was successful
        if (paymentIntent.status === 'succeeded') {
            // Update payment status
            const result = await queryDb<ResultSetHeader>(
                "UPDATE payments SET status = 'completed', paid_at = NOW() WHERE transaction_reference = ? AND order_id = ?",
                [payment_intent_id, order_id]
            );

            if (result.affectedRows === 0) {
                return next(new CustomError("Payment record not found", 404));
            }

            // Update order status to paid
            await queryDb(
                "UPDATE orders SET status = 'paid' WHERE id = ?",
                [order_id]
            );

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                payment: {
                    order_id,
                    status: 'completed',
                    transaction_reference: payment_intent_id
                }
            });
        } else {
            // Payment failed or pending
            await queryDb(
                "UPDATE payments SET status = 'failed' WHERE transaction_reference = ? AND order_id = ?",
                [payment_intent_id, order_id]
            );

            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
                payment: {
                    order_id,
                    status: paymentIntent.status,
                    transaction_reference: payment_intent_id
                }
            });
        }
    } catch (error: any) {
        return next(new CustomError(`Payment verification failed: ${error.message}`, 500));
    }
});

// GET /payments/:order_id - Get payment status
export const handleGetPaymentStatus = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { order_id } = req.params;

    // Verify order exists and belongs to user
    const orders = await queryDb<Order[]>(
        "SELECT id FROM orders WHERE id = ? AND user_id = ?",
        [order_id, userId]
    );

    if (orders.length === 0) {
        return next(new CustomError("Order not found", 404));
    }

    // Get payment details
    const payments = await queryDb<Payment[]>(
        "SELECT id, order_id, method, status, transaction_reference, paid_at FROM payments WHERE order_id = ?",
        [order_id]
    );

    if (payments.length === 0) {
        return next(new CustomError("Payment record not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Payment status fetched successfully",
        payment: payments[0]
    });
});
