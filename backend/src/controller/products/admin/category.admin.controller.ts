import { NextFunction, Request, Response } from "express";
import { AsyncCall } from "../../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../../utils/queryDb.js";
import { Category } from "../../../types/category.js";
import CustomError from "../../../utils/customError.js";
import { ResultSetHeader } from "mysql2";

// GET /admin/categories - Get all categories
export const handleGetAllCategories = AsyncCall(async (_req, res, _next) => {
    const categories = await queryDb<Category[]>(
        "SELECT id, name, parent_id FROM categories ORDER BY name ASC"
    );

    res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        categories,
        count: categories.length
    });
});

// POST /admin/categories/new - Create new category
export const handleCreateNewCategory = AsyncCall(
    async (
        req: Request,
        res: Response,
        next: NextFunction) =>
        {


        const { name, parent_id } = req.body;

        const existing = await queryDb("SELECT * FROM categories WHERE name = ?", [name]) as Category[];

        if (existing.length > 0) {
            return next(new CustomError("Category with this name already exists", 400));
        }

        const insertQuery = "INSERT INTO categories (name, parent_id) VALUES (?, ?)";
        const result = await queryDb<ResultSetHeader>(insertQuery, [name, parent_id || null]);

        if (!result || !result.insertId) {
            return next(new CustomError("Failed to create category, some issue with db", 500));
        }

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category: {
                id: result.insertId,
                name,
                parent_id: parent_id || null
            }
        });
    }
);

// PUT /admin/categories/:id - Update category
export const handleUpdateCategory = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { name, parent_id } = req.body;

    // Check if category exists
    const categories = await queryDb<Category[]>(
        "SELECT id FROM categories WHERE id = ?",
        [id]
    );

    if (categories.length === 0) {
        return next(new CustomError("Category not found", 404));
    }

    // If name is being updated, check for duplicates
    if (name) {
        const existing = await queryDb<Category[]>(
            "SELECT id FROM categories WHERE name = ? AND id != ?",
            [name, id]
        );

        if (existing.length > 0) {
            return next(new CustomError("Category with this name already exists", 400));
        }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
        updates.push("name = ?");
        values.push(name);
    }

    if (parent_id !== undefined) {
        updates.push("parent_id = ?");
        values.push(parent_id);
    }

    values.push(id);

    const result = await queryDb<ResultSetHeader>(
        `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
        values
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update category", 500));
    }

    // Get updated category
    const updated = await queryDb<Category[]>(
        "SELECT id, name, parent_id FROM categories WHERE id = ?",
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category: updated[0]
    });
});

// DELETE /admin/categories/:id - Delete category
export const handleDeleteCategory = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if category exists
    const categories = await queryDb<Category[]>(
        "SELECT id FROM categories WHERE id = ?",
        [id]
    );

    if (categories.length === 0) {
        return next(new CustomError("Category not found", 404));
    }

    // Check if category has subcategories
    const subcategories = await queryDb<Category[]>(
        "SELECT id FROM categories WHERE parent_id = ?",
        [id]
    );

    if (subcategories.length > 0) {
        return next(new CustomError("Cannot delete category with subcategories", 400));
    }

    // Check if category has products
    const products = await queryDb<{ id: number }[]>(
        "SELECT id FROM products WHERE category_id = ?",
        [id]
    );

    if (products.length > 0) {
        return next(new CustomError("Cannot delete category with products", 400));
    }

    // Delete category
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM categories WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to delete category", 500));
    }

    res.status(200).json({
        success: true,
        message: "Category deleted successfully"
    });
});