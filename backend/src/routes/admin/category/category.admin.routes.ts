import express from "express";
import {
    handleGetAllCategories,
    handleCreateNewCategory,
    handleUpdateCategory,
    handleDeleteCategory
} from "../../../controller/products/admin/category.admin.controller.js";
import { adminAuthMiddleware } from "../../../middlewares/adminAuth.middleware.js";
import { zodValidate } from "../../../middlewares/zodValidate.middleware.js";
import {
    createCategorySchema,
    updateCategorySchema,
    categoryIdSchema
} from "../../../zod/admin/category/category.admin.zod.js";

const router = express.Router();

// All admin category routes require admin authentication
router.use(adminAuthMiddleware);

// GET /admin/categories - Get all categories
router.get("/", handleGetAllCategories);

// POST /admin/categories/new - Create new category
router.post("/new",
    zodValidate(createCategorySchema, "body"),
    handleCreateNewCategory
);

// PUT /admin/categories/:id - Update category
router.put("/:id",
    zodValidate(categoryIdSchema, "params"),
    zodValidate(updateCategorySchema, "body"),
    handleUpdateCategory
);

// DELETE /admin/categories/:id - Delete category
router.delete("/:id",
    zodValidate(categoryIdSchema, "params"),
    handleDeleteCategory
);

export default router;