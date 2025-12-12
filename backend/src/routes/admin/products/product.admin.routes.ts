import express from "express";
import {
    handleGetAllProducts,
    handleGetProductDetails,
    handleCreateNewProduct,
    handleUpdateProductMetaData,
    handleDeleteProduct,
    handleUpdateProductStatus
} from "../../../controller/products/admin/product.admin.controller.js";
import {
    handleGetProductVariants,
    handleAddProductVariant,
    handleUpdateProductVariant,
    handleDeleteProductVariant,
    handleUpdateVariantStock
} from "../../../controller/products/admin/variant.admin.controller.js";
import { adminAuthMiddleware } from "../../../middlewares/adminAuth.middleware.js";
import { zodValidate } from "../../../middlewares/zodValidate.middleware.js";
import {
    updateProductSchema,
    productIdSchema,
    updateProductStatusSchema
} from "../../../zod/admin/product/productSchema.zod.js";
import {
    createVariantSchema,
    updateVariantSchema,
    updateStockSchema,
    variantIdSchema
} from "../../../zod/admin/product/variantSchema.zod.js";

const router = express.Router();

// All admin product routes require admin authentication
router.use(adminAuthMiddleware);

// GET /admin/products - Get all products (with optional filters)
router.get("/", handleGetAllProducts);

// GET /admin/products/:id - Get product details
router.get("/:id",
    zodValidate(productIdSchema, "params"),
    handleGetProductDetails
);

// POST /admin/products/new - Create new product
router.post("/new", handleCreateNewProduct);

// PUT /admin/products/update - Update product metadata
router.put("/update",
    zodValidate(updateProductSchema, "body"),
    handleUpdateProductMetaData
);

// PUT /admin/products/:id/status - Update product status
router.put("/:id/status",
    zodValidate(productIdSchema, "params"),
    zodValidate(updateProductStatusSchema, "body"),
    handleUpdateProductStatus
);

// DELETE /admin/products/:id - Delete product
router.delete("/:id",
    zodValidate(productIdSchema, "params"),
    handleDeleteProduct
);

// GET /admin/products/:id/variants - Get all variants for a product
router.get("/:id/variants",
    zodValidate(productIdSchema, "params"),
    handleGetProductVariants
);

// POST /admin/products/:id/variants - Add variant to product
router.post("/:id/variants",
    zodValidate(productIdSchema, "params"),
    zodValidate(createVariantSchema, "body"),
    handleAddProductVariant
);

// PUT /admin/products/variants/:id - Update variant
router.put("/variants/:id",
    zodValidate(variantIdSchema, "params"),
    zodValidate(updateVariantSchema, "body"),
    handleUpdateProductVariant
);

// DELETE /admin/products/variants/:id - Delete variant
router.delete("/variants/:id",
    zodValidate(variantIdSchema, "params"),
    handleDeleteProductVariant
);

// PUT /admin/products/variants/:id/stock - Update variant stock
router.put("/variants/:id/stock",
    zodValidate(variantIdSchema, "params"),
    zodValidate(updateStockSchema, "body"),
    handleUpdateVariantStock
);

export default router;