import express from "express"
import {
    handleUploadImage,
    handleAddProductMedia,
    handleDeleteProductMedia,
    handleSetPrimaryMedia
} from "../../../controller/products/admin/media/media.admin.controller.js";
import { adminAuthMiddleware } from "../../../middlewares/adminAuth.middleware.js";
import { zodValidate } from "../../../middlewares/zodValidate.middleware.js";
import { presignQuerySchema } from "../../../zod/admin/product/presign.admin.zod.js";
import {
    addProductMediaSchema,
    productMediaIdSchema,
    productIdParamSchema
} from "../../../zod/admin/product/productMediaSchema.zod.js";

const router = express.Router();

// All admin media routes require admin authentication
router.use(adminAuthMiddleware);

// POST /admin/media/presigned - Get presigned URL
router.post("/presigned", zodValidate(presignQuerySchema, "query"), handleUploadImage);

// POST /admin/products/:id/media - Add media to product
router.post("/products/:id/media",
    zodValidate(productIdParamSchema, "params"),
    zodValidate(addProductMediaSchema, "body"),
    handleAddProductMedia
);

// DELETE /admin/products/media/:id - Delete product media
router.delete("/products/media/:id",
    zodValidate(productMediaIdSchema, "params"),
    handleDeleteProductMedia
);

// PUT /admin/products/media/:id/primary - Set as primary
router.put("/products/media/:id/primary",
    zodValidate(productMediaIdSchema, "params"),
    handleSetPrimaryMedia
);

export default router;  