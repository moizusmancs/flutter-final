import express from "express";
import {
    handleGetAllProducts,
    handleGetOneProduct,
    handleGetProductVariants,
    handleSearchProducts,
    handleGetProductsByCategory
} from "../../controller/products/product.controller.js";
import { zodValidate } from "../../middlewares/zodValidate.middleware.js";
import {
    getAllProductsSchema,
    productIdSchema,
    searchProductSchema,
    categoryIdSchema
} from "../../zod/products/product.zod.js";

const router = express.Router();

// GET /api/v1/products - Get all products with filters
router.get("/", zodValidate(getAllProductsSchema, "query"), handleGetAllProducts);

// GET /api/v1/products/search - Search products (must be before /:id routes)
router.get("/search", zodValidate(searchProductSchema, "query"), handleSearchProducts);

// GET /api/v1/products/category/:id - Get products by category
router.get("/category/:id", zodValidate(categoryIdSchema, "params"), handleGetProductsByCategory);

// GET /api/v1/products/one/:id - Get single product
router.get("/one/:id", zodValidate(productIdSchema, "params"), handleGetOneProduct);

// GET /api/v1/products/:id/variants - Get product variants
router.get("/:id/variants", zodValidate(productIdSchema, "params"), handleGetProductVariants);

export default router;