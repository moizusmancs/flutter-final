import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { WishlistItemWithDetails } from "../../types/wishlist.js";
import { ResultSetHeader } from "mysql2";

// GET /wishlist - Get user's wishlist with full product details
export const handleGetWishlist = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;

    // Get wishlist with product details using JOIN
    const wishlistItems = await queryDb<WishlistItemWithDetails[]>(`
        SELECT
            w.id,
            w.user_id,
            w.variant_id,
            w.created_at,
            pv.size,
            pv.color,
            pv.stock,
            pv.additional_price,
            pv.product_id,
            p.name as product_name,
            p.price as product_price,
            p.discount as product_discount,
            p.description as product_description,
            c.name as category_name,
            pm.url as image_url
        FROM wishlist w
        JOIN product_variants pv ON w.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = 1
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    `, [userId]);

    res.status(200).json({
        success: true,
        message: "Wishlist fetched successfully",
        wishlist: wishlistItems,
        count: wishlistItems.length
    });
});

// POST /wishlist - Add item to wishlist
export const handleAddToWishlist = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { variant_id } = req.body;

    // Check if variant exists
    const variants = await queryDb<{ id: number }[]>(
        "SELECT id FROM product_variants WHERE id = ?",
        [variant_id]
    );

    if (variants.length === 0) {
        return next(new CustomError("Product variant not found", 404));
    }

    // Check if item already in wishlist
    const existingItems = await queryDb<{ id: number }[]>(
        "SELECT id FROM wishlist WHERE user_id = ? AND variant_id = ?",
        [userId, variant_id]
    );

    if (existingItems.length > 0) {
        return next(new CustomError("Item already in wishlist", 400));
    }

    // Add to wishlist
    const result = await queryDb<ResultSetHeader>(
        "INSERT INTO wishlist (user_id, variant_id) VALUES (?, ?)",
        [userId, variant_id]
    );

    if (!result || !result.insertId) {
        return next(new CustomError("Failed to add item to wishlist", 500));
    }

    res.status(201).json({
        success: true,
        message: "Item added to wishlist successfully",
        wishlist_item: {
            id: result.insertId,
            user_id: userId,
            variant_id
        }
    });
});

// DELETE /wishlist/:id - Remove item from wishlist
export const handleRemoveFromWishlist = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check ownership
    const items = await queryDb<{ id: number }[]>(
        "SELECT id FROM wishlist WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (items.length === 0) {
        return next(new CustomError("Wishlist item not found", 404));
    }

    // Delete item
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM wishlist WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to remove item from wishlist", 500));
    }

    res.status(200).json({
        success: true,
        message: "Item removed from wishlist successfully"
    });
});

// DELETE /wishlist/clear - Clear entire wishlist
export const handleClearWishlist = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;

    // Delete all wishlist items for user
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM wishlist WHERE user_id = ?",
        [userId]
    );

    res.status(200).json({
        success: true,
        message: "Wishlist cleared successfully",
        items_removed: result.affectedRows
    });
});
