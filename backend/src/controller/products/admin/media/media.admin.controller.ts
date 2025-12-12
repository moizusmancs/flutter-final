import { NextFunction, Request, Response } from "express";
import { AsyncCall } from "../../../../middlewares/asyncCall.middleware.js";
import CustomError from "../../../../utils/customError.js";
import { generatePresignedUrls } from "../../../../utils/s3.utils.js";
import { queryDb } from "../../../../utils/queryDb.js";
import { ResultSetHeader } from "mysql2";
import { Product } from "../../../../types/product.js";
import { ProductMedia } from "../../../../types/productMedia.js";

export const handleUploadImage = AsyncCall(async (req:Request, res:Response, next: NextFunction) => {

    const {fileName} = req.query;


    const {uploadUrl,
        fileUrl,
        key} = await generatePresignedUrls(fileName as string);


    res.status(200).json({
        success:true,
        message: "Presigned URL generated successfully",
        uploadUrl,
        fileUrl,
        key
    });

});

// POST /admin/products/:id/media - Add media to product
export const handleAddProductMedia = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { url, is_primary } = req.body;

    // Check if product exists
    const products = await queryDb<Product[]>(
        "SELECT id FROM products WHERE id = ?",
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    // If setting as primary, unset other primary media first
    if (is_primary) {
        await queryDb<ResultSetHeader>(
            "UPDATE product_media SET is_primary = FALSE WHERE product_id = ?",
            [id]
        );
    }

    // Insert media
    const result = await queryDb<ResultSetHeader>(
        "INSERT INTO product_media (product_id, url, is_primary) VALUES (?, ?, ?)",
        [id, url, is_primary || false]
    );

    if (!result || !result.insertId) {
        return next(new CustomError("Failed to add media", 500));
    }

    res.status(201).json({
        success: true,
        message: "Media added successfully",
        media: {
            id: result.insertId,
            product_id: Number(id),
            url,
            is_primary: is_primary || false
        }
    });
});

// DELETE /admin/products/media/:id - Delete product media
export const handleDeleteProductMedia = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if media exists
    const media = await queryDb<ProductMedia[]>(
        "SELECT id FROM product_media WHERE id = ?",
        [id]
    );

    if (media.length === 0) {
        return next(new CustomError("Media not found", 404));
    }

    // Delete media
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM product_media WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to delete media", 500));
    }

    res.status(200).json({
        success: true,
        message: "Media deleted successfully"
    });
});

// PUT /admin/products/media/:id/primary - Set as primary
export const handleSetPrimaryMedia = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if media exists
    const media = await queryDb<ProductMedia[]>(
        "SELECT id, product_id FROM product_media WHERE id = ?",
        [id]
    );

    if (media.length === 0) {
        return next(new CustomError("Media not found", 404));
    }

    const productId = media[0].product_id;

    // Unset all primary media for this product
    await queryDb<ResultSetHeader>(
        "UPDATE product_media SET is_primary = FALSE WHERE product_id = ?",
        [productId]
    );

    // Set this media as primary
    const result = await queryDb<ResultSetHeader>(
        "UPDATE product_media SET is_primary = TRUE WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to set primary media", 500));
    }

    res.status(200).json({
        success: true,
        message: "Media set as primary successfully",
        media: {
            id: Number(id),
            is_primary: true
        }
    });
})