import { NextFunction, Request, Response } from "express";
import { AsyncCall } from "../../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../../utils/queryDb.js";
import { ResultSetHeader } from "mysql2";
import { Product } from "../../../types/product.js";
import type { ProductVariant } from "../../../types/variant.js";
import CustomError from "../../../utils/customError.js";

// GET /admin/products/:id/variants - Get all variants for a product
export const handleGetProductVariants = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if product exists
    const products = await queryDb<Product[]>(
        "SELECT id FROM products WHERE id = ?",
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    // Get all variants for the product
    const variants = await queryDb<ProductVariant[]>(
        "SELECT id, product_id, size, color, stock, additional_price FROM product_variants WHERE product_id = ? ORDER BY id ASC",
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Product variants fetched successfully",
        variants,
        count: variants.length
    });
});

// POST /admin/products/:id/variants - Add variant to product
export const handleAddProductVariant = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { size, color, stock, additional_price } = req.body;

    // Check if product exists
    const products = await queryDb<Product[]>(
        "SELECT id FROM products WHERE id = ?",
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    // Check if variant with same size and color already exists
    const existing = await queryDb<ProductVariant[]>(
        "SELECT id FROM product_variants WHERE product_id = ? AND size <=> ? AND color <=> ?",
        [id, size || null, color || null]
    );

    if (existing.length > 0) {
        return next(new CustomError("Variant with same size and color already exists for this product", 400));
    }

    // Insert variant
    const result = await queryDb<ResultSetHeader>(
        "INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES (?, ?, ?, ?, ?)",
        [id, size || null, color || null, stock || 0, additional_price || 0]
    );

    if (!result || !result.insertId) {
        return next(new CustomError("Failed to create variant", 500));
    }

    res.status(201).json({
        success: true,
        message: "Variant added successfully",
        variant: {
            id: result.insertId,
            product_id: Number(id),
            size: size || null,
            color: color || null,
            stock: stock || 0,
            additional_price: additional_price || 0
        }
    });
});

// PUT /admin/products/variants/:id - Update variant
export const handleUpdateProductVariant = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { size, color, stock, additional_price } = req.body;

    // Check if variant exists
    const variants = await queryDb<ProductVariant[]>(
        "SELECT id, product_id FROM product_variants WHERE id = ?",
        [id]
    );

    if (variants.length === 0) {
        return next(new CustomError("Variant not found", 404));
    }

    const variant = variants[0];

    // If size or color is being updated, check for duplicates
    if (size !== undefined || color !== undefined) {
        const newSize = size !== undefined ? size : null;
        const newColor = color !== undefined ? color : null;

        const existing = await queryDb<ProductVariant[]>(
            "SELECT id FROM product_variants WHERE product_id = ? AND size <=> ? AND color <=> ? AND id != ?",
            [variant.product_id, newSize, newColor, id]
        );

        if (existing.length > 0) {
            return next(new CustomError("Variant with same size and color already exists for this product", 400));
        }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (size !== undefined) {
        updates.push("size = ?");
        values.push(size || null);
    }

    if (color !== undefined) {
        updates.push("color = ?");
        values.push(color || null);
    }

    if (stock !== undefined) {
        updates.push("stock = ?");
        values.push(stock);
    }

    if (additional_price !== undefined) {
        updates.push("additional_price = ?");
        values.push(additional_price);
    }

    values.push(id);

    // Update variant
    const result = await queryDb<ResultSetHeader>(
        `UPDATE product_variants SET ${updates.join(", ")} WHERE id = ?`,
        values
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update variant", 500));
    }

    // Get updated variant
    const updated = await queryDb<ProductVariant[]>(
        "SELECT id, product_id, size, color, stock, additional_price FROM product_variants WHERE id = ?",
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Variant updated successfully",
        variant: updated[0]
    });
});

// DELETE /admin/products/variants/:id - Delete variant
export const handleDeleteProductVariant = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if variant exists
    const variants = await queryDb<ProductVariant[]>(
        "SELECT id FROM product_variants WHERE id = ?",
        [id]
    );

    if (variants.length === 0) {
        return next(new CustomError("Variant not found", 404));
    }

    // Check if variant is in any cart
    const cartItems = await queryDb<{ id: number }[]>(
        "SELECT id FROM cart WHERE variant_id = ?",
        [id]
    );

    if (cartItems.length > 0) {
        return next(new CustomError("Cannot delete variant that is in user carts", 400));
    }

    // Check if variant is in any wishlist
    const wishlistItems = await queryDb<{ id: number }[]>(
        "SELECT id FROM wishlist WHERE variant_id = ?",
        [id]
    );

    if (wishlistItems.length > 0) {
        return next(new CustomError("Cannot delete variant that is in user wishlists", 400));
    }

    // Delete variant
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM product_variants WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to delete variant", 500));
    }

    res.status(200).json({
        success: true,
        message: "Variant deleted successfully"
    });
});

// PUT /admin/products/variants/:id/stock - Update variant stock
export const handleUpdateVariantStock = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { stock } = req.body;

    // Check if variant exists
    const variants = await queryDb<ProductVariant[]>(
        "SELECT id FROM product_variants WHERE id = ?",
        [id]
    );

    if (variants.length === 0) {
        return next(new CustomError("Variant not found", 404));
    }

    // Update stock
    const result = await queryDb<ResultSetHeader>(
        "UPDATE product_variants SET stock = ? WHERE id = ?",
        [stock, id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update stock", 500));
    }

    res.status(200).json({
        success: true,
        message: "Variant stock updated successfully",
        variant: {
            id: Number(id),
            stock
        }
    });
});
