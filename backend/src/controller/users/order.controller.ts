import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { Order, OrderWithDetails, OrderItemWithDetails } from "../../types/order.js";
import { CartItemWithDetails } from "../../types/cart.js";
import { ResultSetHeader } from "mysql2";

// GET /orders - Get user's order history
export const handleGetOrders = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;

    // Get all orders for user with address and payment details
    const orders = await queryDb<OrderWithDetails[]>(`
        SELECT
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at,
            ua.line1,
            ua.city,
            ua.state,
            ua.country,
            ua.zip_code,
            p.method as payment_method,
            p.status as payment_status,
            p.transaction_reference
        FROM orders o
        JOIN user_address ua ON o.shipping_address_id = ua.id
        LEFT JOIN payments p ON o.payment_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `, [userId]);

    res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        orders,
        count: orders.length
    });
});

// GET /orders/:id - Get specific order details with items
export const handleGetOrderDetails = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Get order with address and payment details
    const orders = await queryDb<OrderWithDetails[]>(`
        SELECT
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at,
            ua.line1,
            ua.city,
            ua.state,
            ua.country,
            ua.zip_code,
            p.method as payment_method,
            p.status as payment_status,
            p.transaction_reference
        FROM orders o
        JOIN user_address ua ON o.shipping_address_id = ua.id
        LEFT JOIN payments p ON o.payment_id = p.id
        WHERE o.id = ? AND o.user_id = ?
    `, [id, userId]);

    if (orders.length === 0) {
        return next(new CustomError("Order not found", 404));
    }

    // Get order items with product details
    const orderItems = await queryDb<OrderItemWithDetails[]>(`
        SELECT
            oi.id,
            oi.order_id,
            oi.variant_id,
            oi.quantity,
            oi.price_at_purchase,
            pv.size,
            pv.color,
            pv.product_id,
            p.name as product_name,
            p.description as product_description,
            pm.url as image_url
        FROM order_items oi
        JOIN product_variants pv ON oi.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = 1
        WHERE oi.order_id = ?
    `, [id]);

    res.status(200).json({
        success: true,
        message: "Order details fetched successfully",
        order: {
            ...orders[0],
            items: orderItems
        }
    });
});

// POST /orders - Create new order from cart
export const handleCreateOrder = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { shipping_address_id, payment_method } = req.body;

    // Verify shipping address exists and belongs to user
    const addresses = await queryDb<{ id: number }[]>(
        "SELECT id FROM user_address WHERE id = ? AND user_id = ?",
        [shipping_address_id, userId]
    );

    if (addresses.length === 0) {
        return next(new CustomError("Shipping address not found", 404));
    }

    // Get cart items with full details
    const cartItems = await queryDb<CartItemWithDetails[]>(`
        SELECT
            c.variant_id,
            c.quantity,
            pv.stock,
            COALESCE(pv.additional_price, 0) as additional_price,
            p.price as product_price,
            COALESCE(p.discount, 0) as product_discount,
            ((p.price + COALESCE(pv.additional_price, 0)) * c.quantity * (1 - COALESCE(p.discount, 0)/100)) as item_total
        FROM cart c
        JOIN product_variants pv ON c.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
        return next(new CustomError("Cart is empty", 400));
    }

    // Verify stock availability for all items
    for (const item of cartItems) {
        if (item.quantity > (item.stock || 0)) {
            return next(new CustomError(`Insufficient stock for one or more items`, 400));
        }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
        const itemTotal = Number(item.item_total) || 0;
        return sum + itemTotal;
    }, 0);

    // Validate total amount is a valid number
    if (isNaN(totalAmount) || !isFinite(totalAmount)) {
        return next(new CustomError("Invalid total amount calculated", 500));
    }

    // Create order
    const orderResult = await queryDb<ResultSetHeader>(
        "INSERT INTO orders (user_id, total_amount, status, shipping_address_id) VALUES (?, ?, 'pending', ?)",
        [userId, totalAmount, shipping_address_id]
    );

    if (!orderResult || !orderResult.insertId) {
        return next(new CustomError("Failed to create order", 500));
    }

    const orderId = orderResult.insertId;

    // Create order items and reduce stock
    for (const item of cartItems) {
        const productPrice = Number(item.product_price) || 0;
        const additionalPrice = Number(item.additional_price) || 0;
        const discount = Number(item.product_discount) || 0;

        const priceAtPurchase = (productPrice + additionalPrice) * (1 - discount / 100);

        // Validate price
        if (isNaN(priceAtPurchase) || !isFinite(priceAtPurchase)) {
            return next(new CustomError("Invalid price calculation", 500));
        }

        // Insert order item
        await queryDb(
            "INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)",
            [orderId, item.variant_id, item.quantity, priceAtPurchase]
        );

        // Reduce stock
        await queryDb(
            "UPDATE product_variants SET stock = stock - ? WHERE id = ?",
            [item.quantity, item.variant_id]
        );
    }

    // Create payment record
    const paymentResult = await queryDb<ResultSetHeader>(
        "INSERT INTO payments (order_id, method, status) VALUES (?, ?, 'pending')",
        [orderId, payment_method]
    );

    // Update order with payment_id
    if (paymentResult && paymentResult.insertId) {
        await queryDb(
            "UPDATE orders SET payment_id = ? WHERE id = ?",
            [paymentResult.insertId, orderId]
        );
    }

    // Clear user's cart
    await queryDb("DELETE FROM cart WHERE user_id = ?", [userId]);

    res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: {
            id: orderId,
            total_amount: parseFloat(totalAmount.toFixed(2)),
            status: 'pending',
            payment_id: paymentResult?.insertId,
            payment_method
        }
    });
});

// PUT /orders/:id/cancel - Cancel order
export const handleCancelOrder = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if order exists and belongs to user
    const orders = await queryDb<Order[]>(
        "SELECT id, status FROM orders WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (orders.length === 0) {
        return next(new CustomError("Order not found", 404));
    }

    // Check if order can be cancelled
    if (orders[0].status === 'cancelled') {
        return next(new CustomError("Order is already cancelled", 400));
    }

    if (orders[0].status === 'shipped' || orders[0].status === 'delivered') {
        return next(new CustomError(`Cannot cancel order that is already ${orders[0].status}`, 400));
    }

    // Get order items to restore stock
    const orderItems = await queryDb<{ variant_id: number, quantity: number }[]>(
        "SELECT variant_id, quantity FROM order_items WHERE order_id = ?",
        [id]
    );

    // Restore stock for each item
    for (const item of orderItems) {
        await queryDb(
            "UPDATE product_variants SET stock = stock + ? WHERE id = ?",
            [item.quantity, item.variant_id]
        );
    }

    // Update order status
    const result = await queryDb<ResultSetHeader>(
        "UPDATE orders SET status = 'cancelled' WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    // Update payment status if exists
    await queryDb(
        "UPDATE payments SET status = 'failed' WHERE order_id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to cancel order", 500));
    }

    res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        order: {
            id: Number(id),
            status: 'cancelled'
        }
    });
});
