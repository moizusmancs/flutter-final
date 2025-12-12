import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { Category } from "../../types/category.js";
import { Product } from "../../types/product.js";

// Interface for category with subcategories
interface CategoryWithSubcategories extends Category {
    subcategories?: Category[];
}

// GET /categories - Get all categories (hierarchical structure)
export const handleGetAllCategories = AsyncCall(async (req, res, next) => {
    // Get all categories
    const categories = await queryDb<Category[]>(
        "SELECT * FROM categories ORDER BY name ASC"
    );

    // Build hierarchical structure
    const categoryMap = new Map<number, CategoryWithSubcategories>();
    const rootCategories: CategoryWithSubcategories[] = [];

    // First pass: create map of all categories
    categories.forEach(cat => {
        categoryMap.set(cat.id!, { ...cat, subcategories: [] });
    });

    // Second pass: build hierarchy
    categories.forEach(cat => {
        const category = categoryMap.get(cat.id!);
        if (cat.parent_id === null) {
            // Root category
            rootCategories.push(category!);
        } else {
            // Subcategory - add to parent
            const parent = categoryMap.get(cat.parent_id);
            if (parent) {
                parent.subcategories!.push(category!);
            }
        }
    });

    res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        categories: rootCategories
    });
});

// GET /categories/:id - Get single category with its subcategories
export const handleGetOneCategory = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Get the category
    const categories = await queryDb<Category[]>(
        "SELECT * FROM categories WHERE id = ?",
        [id]
    );

    if (categories.length === 0) {
        return next(new CustomError("Category not found", 404));
    }

    const category = categories[0];

    // Get subcategories
    const subcategories = await queryDb<Category[]>(
        "SELECT * FROM categories WHERE parent_id = ? ORDER BY name ASC",
        [id]
    );

    // Get parent category if exists
    let parentCategory = null;
    if (category.parent_id) {
        const parents = await queryDb<Category[]>(
            "SELECT * FROM categories WHERE id = ?",
            [category.parent_id]
        );
        parentCategory = parents.length > 0 ? parents[0] : null;
    }

    // Get product count in this category
    const countResult = await queryDb<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM products WHERE category_id = ?",
        [id]
    );
    const productCount = countResult[0].count;

    res.status(200).json({
        success: true,
        message: "Category fetched successfully",
        category: {
            ...category,
            subcategories,
            parent: parentCategory,
            product_count: productCount
        }
    });
});

// GET /categories/:id/products - Get all products in a category (with pagination)
export const handleGetCategoryProducts = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { page, limit, sort } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    const orderBy = sort === "asc" ? "ASC" : "DESC";

    // Check if category exists
    const categories = await queryDb<Category[]>(
        "SELECT * FROM categories WHERE id = ?",
        [id]
    );

    if (categories.length === 0) {
        return next(new CustomError("Category not found", 404));
    }

    // Get total count
    const countResult = await queryDb<{ total: number }[]>(
        "SELECT COUNT(*) as total FROM products WHERE category_id = ?",
        [id]
    );
    const total = countResult[0].total;

    // Get products
    const products = await queryDb<Product[]>(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.category_id = ?
         ORDER BY p.created_at ${orderBy}
         LIMIT ? OFFSET ?`,
        [id, limitNum, offset]
    );

    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        category: categories[0],
        products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
        }
    });
});
