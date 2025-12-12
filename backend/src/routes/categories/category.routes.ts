import express from "express";
import {
    handleGetAllCategories,
    handleGetOneCategory,
    handleGetCategoryProducts
} from "../../controller/categories/category.controller.js";
import { zodValidate } from "../../middlewares/zodValidate.middleware.js";
import { categoryIdSchema, categoryProductsSchema } from "../../zod/categories/category.zod.js";

const router = express.Router();

// GET /api/v1/categories - Get all categories (hierarchical)
router.get("/", handleGetAllCategories);

// GET /api/v1/categories/:id/products - Get products in category (must be before /:id)
router.get(
    "/:id/products",
    zodValidate(categoryIdSchema, "params"),
    zodValidate(categoryProductsSchema, "query"),
    handleGetCategoryProducts
);

// GET /api/v1/categories/:id - Get single category with subcategories
router.get("/:id", zodValidate(categoryIdSchema, "params"), handleGetOneCategory);

export default router;
