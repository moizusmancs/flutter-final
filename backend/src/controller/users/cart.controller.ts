import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { CartItemWithDetails } from "../../types/cart.js";
import { ResultSetHeader } from "mysql2";

// GET /cart - Get user's cart with full product details
export const handleGetCart = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;

    // Get cart with product details using JOIN
    const cartItems = await queryDb<CartItemWithDetails[]>(`
        SELECT
            c.id,
            c.user_id,
            c.variant_id,
            c.quantity,
            pv.size,
            pv.color,
            pv.stock,
            pv.additional_price,
            pv.product_id,
            p.name as product_name,
            p.price as product_price,
            p.discount as product_discount,
            p.description as product_description,
            cat.name as category_name,
            pm.url as image_url,
            ((p.price + pv.additional_price) * c.quantity * (1 - p.discount/100)) as item_total
        FROM cart c
        JOIN product_variants pv ON c.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN categories cat ON p.category_id = cat.id
        LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = 1
        WHERE c.user_id = ?
        ORDER BY c.id DESC
    `, [userId]);

    // Calculate cart total - ensure we convert strings to numbers
    const cartTotal = cartItems.reduce((sum, item) => {
        const itemTotal = typeof item.item_total === 'string'
            ? parseFloat(item.item_total)
            : (item.item_total || 0);
        return sum + itemTotal;
    }, 0);

    res.status(200).json({
        success: true,
        message: "Cart fetched successfully",
        cart: cartItems,
        count: cartItems.length,
        total: parseFloat(cartTotal.toFixed(2))
    });
});

// POST /cart - Add item to cart
export const handleAddToCart = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { variant_id, quantity } = req.body;

    // Check if variant exists and get stock
    const variants = await queryDb<{ id: number, stock: number }[]>(
        "SELECT id, stock FROM product_variants WHERE id = ?",
        [variant_id]
    );

    if (variants.length === 0) {
        return next(new CustomError("Product variant not found", 404));
    }

    // Check stock availability
    if (variants[0].stock < quantity) {
        return next(new CustomError(`Only ${variants[0].stock} items available in stock`, 400));
    }

    // Check if item already in cart
    const existingItems = await queryDb<{ id: number, quantity: number }[]>(
        "SELECT id, quantity FROM cart WHERE user_id = ? AND variant_id = ?",
        [userId, variant_id]
    );

    if (existingItems.length > 0) {
        // Update existing item quantity
        const newQuantity = existingItems[0].quantity + quantity;

        // Check if new quantity exceeds stock
        if (newQuantity > variants[0].stock) {
            return next(new CustomError(`Cannot add more items. Only ${variants[0].stock} available`, 400));
        }

        // Check max quantity limit
        if (newQuantity > 10) {
            return next(new CustomError("Maximum quantity per item is 10", 400));
        }

        await queryDb(
            "UPDATE cart SET quantity = ? WHERE id = ?",
            [newQuantity, existingItems[0].id]
        );

        return res.status(200).json({
            success: true,
            message: "Cart item quantity updated",
            cart_item: {
                id: existingItems[0].id,
                user_id: userId,
                variant_id,
                quantity: newQuantity
            }
        });
    }

    // Add new item to cart
    const result = await queryDb<ResultSetHeader>(
        "INSERT INTO cart (user_id, variant_id, quantity) VALUES (?, ?, ?)",
        [userId, variant_id, quantity]
    );

    if (!result || !result.insertId) {
        return next(new CustomError("Failed to add item to cart", 500));
    }

    res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        cart_item: {
            id: result.insertId,
            user_id: userId,
            variant_id,
            quantity
        }
    });
});

// PUT /cart/:id - Update cart item quantity
export const handleUpdateCartItem = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // Check ownership and get variant info
    const cartItems = await queryDb<{ id: number, variant_id: number }[]>(
        "SELECT id, variant_id FROM cart WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (cartItems.length === 0) {
        return next(new CustomError("Cart item not found", 404));
    }

    // Check stock availability
    const variants = await queryDb<{ stock: number }[]>(
        "SELECT stock FROM product_variants WHERE id = ?",
        [cartItems[0].variant_id]
    );

    if (variants[0].stock < quantity) {
        return next(new CustomError(`Only ${variants[0].stock} items available in stock`, 400));
    }

    // Update quantity
    const result = await queryDb<ResultSetHeader>(
        "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?",
        [quantity, id, userId]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update cart item", 500));
    }

    res.status(200).json({
        success: true,
        message: "Cart item updated successfully",
        cart_item: {
            id: Number(id),
            quantity
        }
    });
});

// DELETE /cart/:id - Remove item from cart
export const handleRemoveFromCart = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check ownership
    const items = await queryDb<{ id: number }[]>(
        "SELECT id FROM cart WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (items.length === 0) {
        return next(new CustomError("Cart item not found", 404));
    }

    // Delete item
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM cart WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to remove item from cart", 500));
    }

    res.status(200).json({
        success: true,
        message: "Item removed from cart successfully"
    });
});

// DELETE /cart/clear - Clear entire cart
export const handleClearCart = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;

    // Delete all cart items for user
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM cart WHERE user_id = ?",
        [userId]
    );

    res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
        items_removed: result.affectedRows
    });
});
