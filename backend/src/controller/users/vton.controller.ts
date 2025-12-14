import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { generatePresignedUrls, generatePresignedDownloadUrl } from "../../utils/s3.utils.js";
import { UserImage, VtonGenerated } from "../../types/vton.js";
import { ResultSetHeader } from "mysql2";
import {
    getLightXUploadUrl,
    uploadImageToLightX,
    initiateLightXTryOn,
    pollForVtonResult
} from "../../utils/vton.utils.js";
import axios from "axios";

// GET /vton/upload-url - Get presigned URL for uploading user image to our S3
export const handleGetVtonUploadUrl = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { fileName } = req.query;

    if (!fileName || typeof fileName !== 'string') {
        return next(new CustomError("fileName is required", 400));
    }

    try {
        const { uploadUrl, fileUrl, key } = await generatePresignedUrls(fileName, 'vton');

        res.status(200).json({
            success: true,
            message: "Upload URL generated successfully",
            data: {
                uploadUrl,
                fileUrl,
                s3Key: key
            }
        });
    } catch (error: any) {
        return next(new CustomError(error.message || "Failed to generate upload URL", 500));
    }
});

// POST /vton/save-user-image - Save user image URL after upload
export const handleSaveUserImage = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { imageUrl, s3Key } = req.body;

    if (!imageUrl || !s3Key) {
        return next(new CustomError("imageUrl and s3Key are required", 400));
    }

    try {
        const result = await queryDb<ResultSetHeader>(
            "INSERT INTO user_images (user_id, image_url, s3_key) VALUES (?, ?, ?)",
            [userId, imageUrl, s3Key]
        );

        res.status(201).json({
            success: true,
            message: "User image saved successfully",
            data: {
                id: result.insertId,
                imageUrl
            }
        });
    } catch (error: any) {
        return next(new CustomError(error.message || "Failed to save user image", 500));
    }
});

// GET /vton/user-images - Get all user uploaded images
export const handleGetUserImages = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;

    try {
        const images = await queryDb<UserImage[]>(
            "SELECT id, user_id, image_url, s3_key, created_at FROM user_images WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        res.status(200).json({
            success: true,
            message: "User images fetched successfully",
            images,
            count: images.length
        });
    } catch (error: any) {
        return next(new CustomError(error.message || "Failed to fetch user images", 500));
    }
});

// POST /vton/generate - Generate virtual try-on image
export const handleGenerateVton = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { userImageId, productId, segmentationType = 0 } = req.body;

    if (!userImageId || !productId) {
        return next(new CustomError("userImageId and productId are required", 400));
    }

    try {
        // Get user image
        const userImages = await queryDb<UserImage[]>(
            "SELECT * FROM user_images WHERE id = ? AND user_id = ?",
            [userImageId, userId]
        );

        if (userImages.length === 0) {
            return next(new CustomError("User image not found", 404));
        }

        const userImage = userImages[0];

        // Get product primary image
        const productImages = await queryDb<{ url: string }[]>(
            "SELECT url FROM product_media WHERE product_id = ? AND is_primary = 1 LIMIT 1",
            [productId]
        );

        if (productImages.length === 0) {
            return next(new CustomError("Product image not found", 404));
        }

        const productImageUrl = productImages[0].url;

        // Step 1: Generate presigned URL for user image and upload to LightX
        console.log('Generating presigned URL for user image...');
        const userImagePresignedUrl = await generatePresignedDownloadUrl(userImage.s3_key, 'vton');

        console.log('Fetching user image from S3...');
        const userImageResponse = await axios.get(userImagePresignedUrl, {
            responseType: 'arraybuffer'
        });
        const userImageBuffer = Buffer.from(userImageResponse.data);

        console.log('Getting LightX upload URL for user image...');
        const lightxUserUpload = await getLightXUploadUrl(userImageBuffer.length, 'image/jpeg');

        console.log('Uploading user image to LightX...');
        await uploadImageToLightX(lightxUserUpload.body.uploadImage, userImageBuffer, 'image/jpeg');

        // Step 2: Upload product image to LightX
        console.log('Fetching product image...');
        const productImageResponse = await axios.get(productImageUrl, {
            responseType: 'arraybuffer'
        });
        const productImageBuffer = Buffer.from(productImageResponse.data);

        console.log('Getting LightX upload URL for product image...');
        const lightxProductUpload = await getLightXUploadUrl(productImageBuffer.length, 'image/jpeg');

        console.log('Uploading product image to LightX...');
        await uploadImageToLightX(lightxProductUpload.body.uploadImage, productImageBuffer, 'image/jpeg');

        // Step 3: Initiate Virtual Try-On
        console.log('Initiating virtual try-on...');
        const tryOnResponse = await initiateLightXTryOn(
            lightxUserUpload.body.imageUrl,
            lightxProductUpload.body.imageUrl,
            segmentationType
        );

        const orderId = tryOnResponse.body.orderId;

        // Save to database with processing status
        const insertResult = await queryDb<ResultSetHeader>(
            `INSERT INTO vton_generated
            (user_id, user_image_id, product_id, generated_image_url, lightx_order_id, segmentation_type, status)
            VALUES (?, ?, ?, '', ?, ?, 'processing')`,
            [userId, userImageId, productId, orderId, segmentationType]
        );

        const vtonId = insertResult.insertId;

        res.status(202).json({
            success: true,
            message: "Virtual try-on initiated",
            data: {
                vtonId,
                orderId,
                status: 'processing',
                maxRetries: tryOnResponse.body.maxRetriesAllowed,
                avgResponseTime: tryOnResponse.body.avgResponseTimeInSec
            }
        });

        // Poll for result in background (non-blocking)
        pollForVtonResult(orderId)
            .then(async (outputUrl) => {
                // Update database with completed status
                await queryDb(
                    "UPDATE vton_generated SET generated_image_url = ?, status = 'completed' WHERE id = ?",
                    [outputUrl, vtonId]
                );
                console.log(`VTON ${vtonId} completed successfully`);
            })
            .catch(async (error) => {
                // Update database with failed status
                await queryDb(
                    "UPDATE vton_generated SET status = 'failed' WHERE id = ?",
                    [vtonId]
                );
                console.error(`VTON ${vtonId} failed:`, error.message);
            });

    } catch (error: any) {
        console.error('Error generating VTON:', error);
        return next(new CustomError(error.message || "Failed to generate virtual try-on", 500));
    }
});

// GET /vton/status/:vtonId - Check status of VTON generation
export const handleGetVtonStatus = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { vtonId } = req.params;

    try {
        const results = await queryDb<VtonGenerated[]>(
            "SELECT * FROM vton_generated WHERE id = ? AND user_id = ?",
            [vtonId, userId]
        );

        if (results.length === 0) {
            return next(new CustomError("VTON record not found", 404));
        }

        const vtonRecord = results[0];

        res.status(200).json({
            success: true,
            message: "VTON status fetched successfully",
            data: {
                id: vtonRecord.id,
                status: vtonRecord.status,
                generatedImageUrl: vtonRecord.generated_image_url || null,
                productId: vtonRecord.product_id,
                createdAt: vtonRecord.created_at
            }
        });
    } catch (error: any) {
        return next(new CustomError(error.message || "Failed to fetch VTON status", 500));
    }
});

// GET /vton/history - Get user's VTON history
export const handleGetVtonHistory = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;

    try {
        const history = await queryDb<any[]>(
            `SELECT
                vg.id,
                vg.product_id,
                vg.generated_image_url,
                vg.status,
                vg.created_at,
                p.name as product_name,
                pm.url as product_image_url,
                ui.image_url as user_image_url
            FROM vton_generated vg
            JOIN products p ON vg.product_id = p.id
            JOIN user_images ui ON vg.user_image_id = ui.id
            LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = 1
            WHERE vg.user_id = ?
            ORDER BY vg.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            message: "VTON history fetched successfully",
            history,
            count: history.length
        });
    } catch (error: any) {
        return next(new CustomError(error.message || "Failed to fetch VTON history", 500));
    }
});

// DELETE /vton/user-image/:imageId - Delete user uploaded image
export const handleDeleteUserImage = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { imageId } = req.params;

    try {
        const result = await queryDb<ResultSetHeader>(
            "DELETE FROM user_images WHERE id = ? AND user_id = ?",
            [imageId, userId]
        );

        if (result.affectedRows === 0) {
            return next(new CustomError("Image not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User image deleted successfully"
        });
    } catch (error: any) {
        return next(new CustomError(error.message || "Failed to delete user image", 500));
    }
});
