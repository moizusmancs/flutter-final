import { Router } from 'express';
import {
    handleGetVtonUploadUrl,
    handleSaveUserImage,
    handleGetUserImages,
    handleGenerateVton,
    handleGetVtonStatus,
    handleGetVtonHistory,
    handleDeleteUserImage
} from '../../controller/users/vton.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

// All VTON routes require authentication
router.use(authMiddleware);

// GET /vton/upload-url - Get presigned URL for uploading user image
router.get('/upload-url', handleGetVtonUploadUrl);

// POST /vton/save-user-image - Save user image after upload
router.post('/save-user-image', handleSaveUserImage);

// GET /vton/user-images - Get all user uploaded images
router.get('/user-images', handleGetUserImages);

// POST /vton/generate - Generate virtual try-on
router.post('/generate', handleGenerateVton);

// GET /vton/status/:vtonId - Check VTON generation status
router.get('/status/:vtonId', handleGetVtonStatus);

// GET /vton/history - Get user's VTON history
router.get('/history', handleGetVtonHistory);

// DELETE /vton/user-image/:imageId - Delete user image
router.delete('/user-image/:imageId', handleDeleteUserImage);

export default router;
